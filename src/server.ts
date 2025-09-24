import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { FigmaClient } from './figma.js';

const token = process.env.FIGMA_TOKEN || '';
const defaultFileId = process.env.FIGMA_FILE_ID || '';

const figma = new FigmaClient(token);

const server = new McpServer({
  name: 'sethdford-mcp-figma',
  version: '0.1.0',
});

server.tool('figma.getFile', 'Fetch a Figma file by ID', {
  fileId: z.string().optional().describe('Figma file ID; falls back to FIGMA_FILE_ID'),
}, async ({ fileId }) => {
  const targetFileId = fileId || defaultFileId;
  if (!targetFileId) {
    throw new Error('fileId is required (or set FIGMA_FILE_ID)');
  }
  const data = await figma.getFile(targetFileId);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.searchNodes', 'Search nodes in a Figma file by query', {
  fileId: z.string().optional(),
  query: z.string().min(1),
}, async ({ fileId, query }) => {
  const targetFileId = fileId || defaultFileId;
  if (!targetFileId) {
    throw new Error('fileId is required (or set FIGMA_FILE_ID)');
  }
  const data = await figma.searchNodes(targetFileId, query);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.getNodeImages', 'Get rendered images for node IDs', {
  fileId: z.string().optional(),
  nodeIds: z.array(z.string()).min(1),
  format: z.enum(['png','jpg','svg']).optional(),
}, async ({ fileId, nodeIds, format }) => {
  const targetFileId = fileId || defaultFileId;
  if (!targetFileId) { throw new Error('fileId is required (or set FIGMA_FILE_ID)'); }
  const data = await figma.getNodeImages(targetFileId, nodeIds, (format as any));
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.listTeamProjects', 'List projects for a Figma team', {
  teamId: z.string(),
}, async ({ teamId }) => {
  const data = await figma.listTeamProjects(teamId);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.listProjectFiles', 'List files under a Figma project', {
  projectId: z.string(),
}, async ({ projectId }) => {
  const data = await figma.listProjectFiles(projectId);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.getMe', 'Get authenticated user info', {}, async () => {
  const data = await figma.getMe();
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
