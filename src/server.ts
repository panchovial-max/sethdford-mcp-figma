import 'dotenv/config';
import { createServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/transport/stdio.js';
import { z } from 'zod';
import { FigmaClient } from './figma.js';

const token = process.env.FIGMA_TOKEN || '';
const defaultFileId = process.env.FIGMA_FILE_ID || '';

const figma = new FigmaClient(token);

const server = createServer({
  name: 'sethdford-mcp-figma',
  version: '0.1.0',
});

server.tool('figma.getFile', {
  description: 'Fetch a Figma file by ID',
  schema: z.object({
    fileId: z.string().optional().describe('Figma file ID; falls back to FIGMA_FILE_ID'),
  }),
  async run({ fileId }) {
    const targetFileId = fileId || defaultFileId;
    if (!targetFileId) {
      throw new Error('fileId is required (or set FIGMA_FILE_ID)');
    }
    const data = await figma.getFile(targetFileId);
    return { content: [{ type: 'json', json: data }] };
  },
});

server.tool('figma.searchNodes', {
  description: 'Search nodes in a Figma file by query',
  schema: z.object({
    fileId: z.string().optional(),
    query: z.string().min(1),
  }),
  async run({ fileId, query }) {
    const targetFileId = fileId || defaultFileId;
    if (!targetFileId) {
      throw new Error('fileId is required (or set FIGMA_FILE_ID)');
    }
    const data = await figma.searchNodes(targetFileId, query);
    return { content: [{ type: 'json', json: data }] };
  },
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
