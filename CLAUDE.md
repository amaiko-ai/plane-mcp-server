# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides tools for managing Plane intake queues. It allows AI assistants to interact with Plane's triage workflow through standardized tools.

**Key Concepts:**
- MCP Server: Uses `@modelcontextprotocol/sdk` to expose tools via stdio transport
- Plane Integration: Communicates with Plane API (cloud or self-hosted) using API key authentication
- Intake Queue: Manages triage workflow with statuses: pending (-2), declined (-1), accepted (1), duplicate (2)

## Architecture

**Single-file MCP server** (`src/index.ts`):
1. Environment validation (API key, workspace slug, host URL)
2. Server initialization with tool definitions
3. Request handlers:
   - `ListToolsRequestSchema`: Returns available tool definitions
   - `CallToolRequestSchema`: Executes tool actions (list, accept, decline, mark duplicate)
4. Plane API communication via `planeRequest()` helper
5. Stdio transport for MCP protocol communication

**API Pattern:**
- Base URL: `${PLANE_API_HOST}/api/v1`
- Auth: `X-API-Key` header
- Endpoints follow pattern: `workspaces/{slug}/projects/{id}/intake-issues/`

## Development Commands

**Build:**
```bash
pnpm build
```
Compiles TypeScript to `build/` directory and makes the binary executable.

**Linting:**
```bash
pnpm lint          # Check code quality
pnpm lint:fix      # Auto-fix issues
pnpm lint:ci       # CI-optimized (used in GitHub Actions)
```

**Local Testing:**
```bash
# Development mode with tsx
pnpm dev

# With MCP Inspector for debugging
npx @modelcontextprotocol/inspector pnpm dev
```

**Environment Setup:**
Required environment variables for testing:
```bash
export PLANE_API_KEY=your-api-key
export PLANE_WORKSPACE_SLUG=your-workspace
export PLANE_API_HOST_URL=https://app.plane.so  # optional, defaults to app.plane.so
```

## Type Safety

- Strict TypeScript mode enabled
- Node16 module resolution
- Biome linter enforces `noExplicitAny` rule (no `any` types allowed)
- Plane API responses use proper TypeScript interfaces (`PlaneIntakeItem`, `PlaneIssueDetail`, etc.)
- All code must pass `pnpm lint` before committing

## Tool Implementations

When modifying tools:
1. Update tool definition in `ListToolsRequestSchema` handler
2. Update switch case in `CallToolRequestSchema` handler
3. Ensure proper error handling (try-catch returns structured error response)
4. Return JSON-stringified responses with proper formatting (`null, 2`)

## Publishing

The package is published to npm as `@amaiko-ai/plane-mcp-server`. The entire release process is automated via GitHub Actions.

**Automated Release Workflow (release-please):**
1. Push commits to `main` using conventional commit format:
   - `feat:` - New features (triggers minor version bump)
   - `fix:` - Bug fixes (triggers patch version bump)
   - `feat!:` or `BREAKING CHANGE:` - Breaking changes (triggers major version bump)
   - `chore:`, `docs:`, `style:`, etc. - No version bump

2. release-please automatically:
   - Creates/updates a "Release PR" with version bump + changelog
   - When you merge the PR → creates GitHub release + tag
   - GitHub release triggers `.github/workflows/publish.yml`
   - Package published to npm with provenance

**Manual override:**
- Go to Actions → "Publish to npm" → "Run workflow" to publish without a release

**Pre-publish:**
- `prepublishOnly` script runs `pnpm build` automatically

## API Status Codes

Intake item statuses (used in filters and updates):
- `-2`: Pending (default)
- `-1`: Declined/Rejected
- `1`: Accepted (converts to regular issue)
- `2`: Duplicate

## Testing Workflow

1. Set environment variables
2. Run `pnpm dev` in one terminal
3. In another terminal, use MCP Inspector:
   ```bash
   npx @modelcontextprotocol/inspector pnpm dev
   ```
4. Or test via Claude Desktop by adding to config and restarting

## Error Handling Pattern

All tool handlers follow this pattern:
```typescript
try {
  // Tool logic
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
} catch (error) {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: message }) }],
    isError: true
  };
}
```
