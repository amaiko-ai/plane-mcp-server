/**
 * Plane API client
 */

import { config } from './config.js';

export class PlaneClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly workspaceSlug: string;

  constructor() {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.workspaceSlug = config.workspaceSlug;
  }

  async request(method: string, path: string, body: unknown = null): Promise<unknown> {
    const url = `${this.baseUrl}/${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'X-API-Key': this.apiKey,
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

  getWorkspacePath(path: string): string {
    return `workspaces/${this.workspaceSlug}/${path}`;
  }
}

export const planeClient = new PlaneClient();
