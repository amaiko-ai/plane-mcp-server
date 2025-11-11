/**
 * Configuration and environment validation
 */

export interface Config {
  apiKey: string;
  apiHost: string;
  workspaceSlug: string;
  baseUrl: string;
}

function validateEnv(): Config {
  const apiKey = process.env.PLANE_API_KEY;
  const apiHost = process.env.PLANE_API_HOST_URL || 'https://app.plane.so';
  const workspaceSlug = process.env.PLANE_WORKSPACE_SLUG;

  if (!apiKey) {
    console.error('ERROR: PLANE_API_KEY environment variable is required');
    console.error('Get your API key from: Settings > API Tokens');
    process.exit(1);
  }

  if (!workspaceSlug) {
    console.error('ERROR: PLANE_WORKSPACE_SLUG environment variable is required');
    console.error('This is your workspace identifier in Plane');
    process.exit(1);
  }

  return {
    apiKey,
    apiHost,
    workspaceSlug,
    baseUrl: `${apiHost}/api/v1`,
  };
}

export const config = validateEnv();
