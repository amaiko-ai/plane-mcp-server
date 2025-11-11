/**
 * MCP tool definitions (schemas)
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const toolDefinitions: Tool[] = [
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
];
