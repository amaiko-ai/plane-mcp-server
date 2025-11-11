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
import { config } from './config.js';
import { toolDefinitions } from './tools/definitions.js';
import { handleToolCall } from './tools/handlers.js';

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

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: toolDefinitions };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleToolCall(name, args as Record<string, unknown>);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Plane Intake MCP Server running');
  console.error(`Connected to: ${config.apiHost}`);
  console.error(`Workspace: ${config.workspaceSlug}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
