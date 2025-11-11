/**
 * MCP tool definitions (schemas)
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const toolDefinitions: Tool[] = [
  {
    name: 'list_projects',
    description:
      'List all projects in the workspace. Use this to find project IDs and identifiers.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_issue',
    description:
      'Get issue details using readable identifier (e.g., FIRST-123). Provides full issue information including description, state, assignees.',
    inputSchema: {
      type: 'object',
      properties: {
        project_identifier: {
          type: 'string',
          description: 'Project identifier (e.g., "FIRST" from FIRST-123)',
        },
        issue_number: {
          type: 'string',
          description: 'Issue number (e.g., "123" from FIRST-123)',
        },
      },
      required: ['project_identifier', 'issue_number'],
    },
  },
  {
    name: 'list_project_issues',
    description:
      'List issues in a project. Useful for finding duplicates and understanding project context. Returns up to 20 issues by default.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'UUID of the project',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of issues to return (default: 20, max: 100)',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'list_labels',
    description:
      'List all labels in a project. Use this to find label IDs for categorizing accepted intake items.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'UUID of the project',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'list_states',
    description: 'List all workflow states in a project.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'UUID of the project',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_workspace_members',
    description: 'Get all members in the workspace. Use for assigning issues.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'add_issue_comment',
    description: 'Add a comment to an issue or intake item. Use to document triage decisions.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'UUID of the project',
        },
        issue_id: {
          type: 'string',
          description: 'UUID of the issue',
        },
        comment: {
          type: 'string',
          description: 'Comment text (plain text, will be converted to HTML)',
        },
      },
      required: ['project_id', 'issue_id', 'comment'],
    },
  },
  {
    name: 'get_issue_comments',
    description: 'Get all comments for an issue or intake item.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'UUID of the project',
        },
        issue_id: {
          type: 'string',
          description: 'UUID of the issue',
        },
      },
      required: ['project_id', 'issue_id'],
    },
  },
  {
    name: 'list_intake_items',
    description:
      'List all intake items for a project. Returns pending, accepted, declined, and duplicate items with optimized response format.',
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
