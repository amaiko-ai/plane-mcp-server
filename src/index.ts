#!/usr/bin/env node

/**
 * Plane Intake MCP Server
 *
 * Provides MCP tools for managing Plane intake queue (triage workflow).
 * Works with any Plane instance (self-hosted or cloud).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Type definitions for Plane API responses
interface PlaneIssueDetail {
  id: string;
  sequence_id: number;
  name: string;
  priority: string;
  created_at: string;
  labels: string[];
}

interface PlaneIntakeItem {
  issue_detail: PlaneIssueDetail;
  status: number;
}

interface PlaneIntakeResponse {
  results: PlaneIntakeItem[];
}

const PLANE_API_KEY = process.env.PLANE_API_KEY;
const PLANE_API_HOST = process.env.PLANE_API_HOST_URL || 'https://app.plane.so';
const WORKSPACE_SLUG = process.env.PLANE_WORKSPACE_SLUG;
const BASE_URL = `${PLANE_API_HOST}/api/v1`;

if (!PLANE_API_KEY) {
  console.error('ERROR: PLANE_API_KEY environment variable is required');
  console.error('Get your API key from: Settings > API Tokens');
  process.exit(1);
}

if (!WORKSPACE_SLUG) {
  console.error('ERROR: PLANE_WORKSPACE_SLUG environment variable is required');
  console.error('This is your workspace identifier in Plane');
  process.exit(1);
}

// MCP Server
const server = new Server(
  {
    name: 'plane-intake',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper to make Plane API requests
async function planeRequest(method: string, path: string, body: unknown = null): Promise<unknown> {
  const url = `${BASE_URL}/${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'X-API-Key': PLANE_API_KEY as string,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Plane API error (${response.status}): ${error}`);
  }

  return response.json();
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_intake_items',
        description:
          'List all intake items for a project. Returns pending, accepted, declined, and duplicate items.',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'UUID of the project',
            },
            status: {
              type: 'string',
              enum: ['-2', '-1', '1', '2'],
              description:
                'Optional filter by status: -2=pending, -1=declined, 1=accepted, 2=duplicate',
            },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'accept_intake_item',
        description:
          'Accept an intake item, converting it to a regular issue. Can optionally add labels.',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'UUID of the project',
            },
            issue_id: {
              type: 'string',
              description: 'UUID of the intake issue',
            },
            label_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional array of label UUIDs to add after accepting',
            },
          },
          required: ['project_id', 'issue_id'],
        },
      },
      {
        name: 'decline_intake_item',
        description: 'Decline/reject an intake item.',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'UUID of the project',
            },
            issue_id: {
              type: 'string',
              description: 'UUID of the intake issue',
            },
          },
          required: ['project_id', 'issue_id'],
        },
      },
      {
        name: 'mark_intake_duplicate',
        description: 'Mark an intake item as duplicate of another issue.',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'UUID of the project',
            },
            duplicate_issue_id: {
              type: 'string',
              description: 'UUID of the duplicate intake issue',
            },
            primary_issue_id: {
              type: 'string',
              description: 'UUID of the primary issue this is a duplicate of',
            },
          },
          required: ['project_id', 'duplicate_issue_id', 'primary_issue_id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_intake_items': {
        const { project_id, status } = args as { project_id: string; status?: string };
        const data = (await planeRequest(
          'GET',
          `workspaces/${WORKSPACE_SLUG}/projects/${project_id}/intake-issues/`
        )) as PlaneIntakeResponse;

        let items = data.results;
        if (status) {
          items = items.filter((i: PlaneIntakeItem) => i.status === parseInt(status, 10));
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  total: items.length,
                  items: items.map((i: PlaneIntakeItem) => ({
                    id: i.issue_detail.id,
                    sequence_id: i.issue_detail.sequence_id,
                    name: i.issue_detail.name,
                    status: i.status,
                    status_text:
                      i.status === -2
                        ? 'pending'
                        : i.status === -1
                          ? 'declined'
                          : i.status === 1
                            ? 'accepted'
                            : 'duplicate',
                    priority: i.issue_detail.priority,
                    created_at: i.issue_detail.created_at,
                    labels: i.issue_detail.labels,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'accept_intake_item': {
        const { project_id, issue_id, label_ids } = args as {
          project_id: string;
          issue_id: string;
          label_ids?: string[];
        };

        // Accept the intake item (converts to issue)
        await planeRequest(
          'PATCH',
          `workspaces/${WORKSPACE_SLUG}/projects/${project_id}/intake-issues/${issue_id}/`,
          {
            status: 1,
          }
        );

        // If labels provided, add them to the converted issue
        if (label_ids && label_ids.length > 0) {
          await planeRequest(
            'PATCH',
            `workspaces/${WORKSPACE_SLUG}/projects/${project_id}/issues/${issue_id}/`,
            {
              labels: label_ids,
            }
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Intake item accepted and converted to issue',
                  issue_id,
                  labels_added: label_ids?.length || 0,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'decline_intake_item': {
        const { project_id, issue_id } = args as { project_id: string; issue_id: string };

        await planeRequest(
          'PATCH',
          `workspaces/${WORKSPACE_SLUG}/projects/${project_id}/intake-issues/${issue_id}/`,
          {
            status: -1,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Intake item declined',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'mark_intake_duplicate': {
        const { project_id, duplicate_issue_id, primary_issue_id } = args as {
          project_id: string;
          duplicate_issue_id: string;
          primary_issue_id: string;
        };

        await planeRequest(
          'PATCH',
          `workspaces/${WORKSPACE_SLUG}/projects/${project_id}/intake-issues/${duplicate_issue_id}/`,
          {
            status: 2,
            duplicate_to: primary_issue_id,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Intake item marked as duplicate of ${primary_issue_id}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: error instanceof Error ? error.message : String(error),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Plane Intake MCP Server running');
  console.error(`Connected to: ${PLANE_API_HOST}`);
  console.error(`Workspace: ${WORKSPACE_SLUG}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
