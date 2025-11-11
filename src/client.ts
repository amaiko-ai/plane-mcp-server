/**
 * Plane API client with connection pooling
 */

import https from 'node:https';
import axios, { type AxiosInstance } from 'axios';
import { config } from './config.js';

export class PlaneClient {
  private readonly client: AxiosInstance;
  private readonly workspaceSlug: string;

  constructor() {
    this.workspaceSlug = config.workspaceSlug;

    // HTTPS agent with connection pooling
    const httpsAgent = new https.Agent({
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
      timeout: 60000,
    });

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      httpsAgent,
    });
  }

  async request(method: string, path: string, body: unknown = null): Promise<unknown> {
    try {
      const response = await this.client.request({
        method,
        url: `/${path}`,
        data: body,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 'unknown';
        const message = error.response?.data || error.message;
        throw new Error(`Plane API error (${status}): ${JSON.stringify(message)}`);
      }
      throw error;
    }
  }

  getWorkspacePath(path: string): string {
    return `workspaces/${this.workspaceSlug}/${path}`;
  }
}

export const planeClient = new PlaneClient();
