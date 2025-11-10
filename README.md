# Plane Intake MCP Server

[![npm version](https://badge.fury.io/js/@amaiko-ai%2Fplane-mcp-server.svg)](https://www.npmjs.com/package/@amaiko-ai/plane-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for managing [Plane](https://plane.so) intake queue (triage workflow). Works with any Plane instance - self-hosted or cloud.

## Features

- **List intake items** with optional status filtering
- **Accept intake items** and convert to regular issues with labels
- **Decline/reject intake items** to keep your queue clean
- **Mark items as duplicates** to reduce noise

## Installation

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "plane-intake": {
      "command": "npx",
      "args": ["-y", "@amaiko-ai/plane-mcp-server"],
      "env": {
        "PLANE_API_KEY": "your-api-key-here",
        "PLANE_API_HOST_URL": "https://app.plane.so",
        "PLANE_WORKSPACE_SLUG": "your-workspace"
      }
    }
  }
}
```

**Configuration file locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

### Claude Code Plugin

If you're using the Amaiko Plane plugin for Claude Code, this server is automatically configured. See the [plane plugin](https://github.com/amaiko-ai/claude-plugins) for details.

### Direct Usage

You can also run the server directly:

```bash
npx @amaiko-ai/plane-mcp-server
```

Or install globally:

```bash
npm install -g @amaiko-ai/plane-mcp-server
plane-mcp-server
```

## Configuration

The server requires these environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PLANE_API_KEY` | ✅ Yes | - | Your Plane API key |
| `PLANE_WORKSPACE_SLUG` | ✅ Yes | - | Your workspace identifier |
| `PLANE_API_HOST_URL` | ❌ No | `https://app.plane.so` | Plane instance URL |

### Getting Your API Key

1. Go to your Plane instance
2. Navigate to **Settings** → **API Tokens**
3. Create a new token
4. Copy and use it as `PLANE_API_KEY`

### Finding Your Workspace Slug

Your workspace slug is in the URL: `https://app.plane.so/{workspace-slug}/...`

## Available Tools

### list_intake_items

List all intake items for a project.

**Parameters:**
- `project_id` (string, required): UUID of the project
- `status` (string, optional): Filter by status
  - `-2`: Pending
  - `-1`: Declined
  - `1`: Accepted
  - `2`: Duplicate

**Example:**
```typescript
{
  "project_id": "abc-123-def-456",
  "status": "-2"  // Only pending items
}
```

### accept_intake_item

Accept an intake item and convert it to a regular issue.

**Parameters:**
- `project_id` (string, required): UUID of the project
- `issue_id` (string, required): UUID of the intake issue
- `label_ids` (array, optional): Label UUIDs to add after accepting

**Example:**
```typescript
{
  "project_id": "abc-123-def-456",
  "issue_id": "issue-789",
  "label_ids": ["label-1", "label-2"]
}
```

### decline_intake_item

Decline/reject an intake item.

**Parameters:**
- `project_id` (string, required): UUID of the project
- `issue_id` (string, required): UUID of the intake issue

**Example:**
```typescript
{
  "project_id": "abc-123-def-456",
  "issue_id": "issue-789"
}
```

### mark_intake_duplicate

Mark an intake item as duplicate of another issue.

**Parameters:**
- `project_id` (string, required): UUID of the project
- `duplicate_issue_id` (string, required): UUID of the duplicate intake issue
- `primary_issue_id` (string, required): UUID of the primary issue

**Example:**
```typescript
{
  "project_id": "abc-123-def-456",
  "duplicate_issue_id": "issue-789",
  "primary_issue_id": "issue-123"
}
```

## Usage Examples

### With Claude Desktop

Once configured, you can ask Claude:

```
"Show me all pending intake items for project ABC"
"Accept intake item XYZ and add labels 'bug' and 'high-priority'"
"Decline intake item ABC"
"Mark intake item DEF as duplicate of issue GHI"
```

### With MCP Inspector

For testing and debugging:

```bash
npx @modelcontextprotocol/inspector npx @amaiko-ai/plane-mcp-server
```

## Development

### Setup

```bash
git clone https://github.com/amaiko-ai/plane-mcp-server.git
cd plane-mcp-server
pnpm install
```

### Build

```bash
pnpm build
```

### Test Locally

```bash
# Set environment variables
export PLANE_API_KEY=your-key
export PLANE_WORKSPACE_SLUG=your-workspace
export PLANE_API_HOST_URL=https://app.plane.so

# Run in development mode
pnpm dev
```

### Testing with MCP Inspector

```bash
export PLANE_API_KEY=your-key
export PLANE_WORKSPACE_SLUG=your-workspace
npx @modelcontextprotocol/inspector pnpm dev
```

## Troubleshooting

### Server won't start

**Check environment variables:**
```bash
echo $PLANE_API_KEY
echo $PLANE_WORKSPACE_SLUG
```

**Verify API key works:**
```bash
curl -H "X-API-Key: $PLANE_API_KEY" \
  "https://app.plane.so/api/v1/workspaces/$PLANE_WORKSPACE_SLUG/projects/"
```

### Tools not appearing in Claude

1. Restart Claude Desktop completely (quit and reopen)
2. Check the MCP logs:
   - macOS: `~/Library/Logs/Claude/mcp.log`
   - Windows: `%APPDATA%\Claude\Logs\mcp.log`
3. Verify your `claude_desktop_config.json` syntax is valid

### API errors

**401 Unauthorized:**
- Verify your API key is correct
- Check key hasn't expired in Plane settings

**404 Not Found:**
- Verify workspace slug is correct
- Ensure project IDs are valid UUIDs

## Roadmap

- [ ] Support for creating intake items
- [ ] Bulk operations (accept/decline multiple)
- [ ] Filtering by priority, labels, assignee
- [ ] Integration with Plane webhooks
- [ ] Support for custom intake workflows

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT © [Amaiko](https://github.com/amaiko-ai)

## Links

- [GitHub Repository](https://github.com/amaiko-ai/plane-mcp-server)
- [npm Package](https://www.npmjs.com/package/@amaiko-ai/plane-mcp-server)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Plane](https://plane.so)
- [Claude Desktop](https://claude.ai/download)

## Support

- [Open an issue](https://github.com/amaiko-ai/plane-mcp-server/issues)
- [Discussions](https://github.com/amaiko-ai/plane-mcp-server/discussions)
