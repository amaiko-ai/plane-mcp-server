/**
 * MCP tool request handlers
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { planeClient } from '../client.js';
import {
  getStatusText,
  IntakeStatus,
  type PlaneIntakeItem,
  type PlaneIntakeResponse,
} from '../types.js';

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  try {
    switch (name) {
      case 'list_intake_items':
        return await listIntakeItems(args);
      case 'accept_intake_item':
        return await acceptIntakeItem(args);
      case 'decline_intake_item':
        return await declineIntakeItem(args);
      case 'mark_intake_duplicate':
        return await markIntakeDuplicate(args);
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
}

async function listIntakeItems(args: Record<string, unknown>): Promise<CallToolResult> {
  const { project_id, status } = args as { project_id: string; status?: string };

  const data = (await planeClient.request(
    'GET',
    planeClient.getWorkspacePath(`projects/${project_id}/intake-issues/`)
  )) as PlaneIntakeResponse;

  let items = data.results;
  if (status) {
    items = items.filter((i: PlaneIntakeItem) => i.status === Number.parseInt(status, 10));
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
              status_text: getStatusText(i.status),
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

async function acceptIntakeItem(args: Record<string, unknown>): Promise<CallToolResult> {
  const { project_id, issue_id, label_ids } = args as {
    project_id: string;
    issue_id: string;
    label_ids?: string[];
  };

  await planeClient.request(
    'PATCH',
    planeClient.getWorkspacePath(`projects/${project_id}/intake-issues/${issue_id}/`),
    {
      status: IntakeStatus.ACCEPTED,
    }
  );

  if (label_ids && label_ids.length > 0) {
    await planeClient.request(
      'PATCH',
      planeClient.getWorkspacePath(`projects/${project_id}/issues/${issue_id}/`),
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

async function declineIntakeItem(args: Record<string, unknown>): Promise<CallToolResult> {
  const { project_id, issue_id } = args as { project_id: string; issue_id: string };

  await planeClient.request(
    'PATCH',
    planeClient.getWorkspacePath(`projects/${project_id}/intake-issues/${issue_id}/`),
    {
      status: IntakeStatus.DECLINED,
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

async function markIntakeDuplicate(args: Record<string, unknown>): Promise<CallToolResult> {
  const { project_id, duplicate_issue_id, primary_issue_id } = args as {
    project_id: string;
    duplicate_issue_id: string;
    primary_issue_id: string;
  };

  await planeClient.request(
    'PATCH',
    planeClient.getWorkspacePath(`projects/${project_id}/intake-issues/${duplicate_issue_id}/`),
    {
      status: IntakeStatus.DUPLICATE,
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
