import { request } from 'undici';

export interface FigmaGetFileResponse {
  name: string;
  document: unknown;
  lastModified: string;
  version: string;
  // partial typing for brevity
}

export class FigmaClient {
  private readonly baseUrl = 'https://api.figma.com/v1';
  private readonly token: string;

  constructor(token: string) {
    if (!token) {
      throw new Error('FIGMA_TOKEN is required');
    }
    this.token = token;
  }

  private async getJson<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await request(url, {
      method: 'GET',
      headers: {
        'X-Figma-Token': this.token,
      },
    });
    if (res.statusCode < 200 || res.statusCode >= 300) {
      const body = await res.body.text();
      throw new Error(`Figma API error ${res.statusCode}: ${body}`);
    }
    return res.body.json() as Promise<T>;
  }

  async getFile(fileId: string): Promise<FigmaGetFileResponse> {
    if (!fileId) throw new Error('fileId is required');
    return this.getJson<FigmaGetFileResponse>(`/files/${encodeURIComponent(fileId)}`);
  }

  async searchNodes(fileId: string, query: string) {
    if (!fileId) throw new Error('fileId is required');
    const q = new URLSearchParams({ query }).toString();
    return this.getJson<unknown>(`/files/${encodeURIComponent(fileId)}/search?${q}`);
  }
}
