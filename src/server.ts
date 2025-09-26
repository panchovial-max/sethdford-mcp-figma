import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { FigmaClient } from './figma.js';
import { FigmaOAuthClient } from './oauth.js';

const token = process.env.FIGMA_TOKEN || '';
const defaultFileId = process.env.FIGMA_FILE_ID || '';

const figma = new FigmaClient(token);

// OAuth configuration (optional)
const oauthConfig = {
  clientId: process.env.FIGMA_CLIENT_ID || '',
  clientSecret: process.env.FIGMA_CLIENT_SECRET || '',
  redirectUri: process.env.FIGMA_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
  port: parseInt(process.env.OAUTH_PORT || '3000')
};

const oauthClient = oauthConfig.clientId ? new FigmaOAuthClient(oauthConfig) : null;

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

server.tool('figma.getNodeThumbnail', 'Get thumbnail image for a specific node', {
  fileId: z.string().optional(),
  nodeId: z.string(),
  format: z.enum(['png','jpg','svg']).optional(),
  scale: z.number().min(0.1).max(4).optional(),
}, async ({ fileId, nodeId, format, scale }) => {
  const targetFileId = fileId || defaultFileId;
  if (!targetFileId) { throw new Error('fileId is required (or set FIGMA_FILE_ID)'); }
  const data = await figma.getNodeThumbnail(targetFileId, nodeId, (format as any), scale);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.getFileImage', 'Get full file image export', {
  fileId: z.string().optional(),
  format: z.enum(['png','jpg','svg']).optional(),
  scale: z.number().min(0.1).max(4).optional(),
}, async ({ fileId, format, scale }) => {
  const targetFileId = fileId || defaultFileId;
  if (!targetFileId) { throw new Error('fileId is required (or set FIGMA_FILE_ID)'); }
  const data = await figma.getFileImage(targetFileId, (format as any), scale);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.getComments', 'Get comments for a Figma file', {
  fileId: z.string().optional(),
}, async ({ fileId }) => {
  const targetFileId = fileId || defaultFileId;
  if (!targetFileId) { throw new Error('fileId is required (or set FIGMA_FILE_ID)'); }
  const data = await figma.getComments(targetFileId);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.getVersions', 'Get version history for a Figma file', {
  fileId: z.string().optional(),
}, async ({ fileId }) => {
  const targetFileId = fileId || defaultFileId;
  if (!targetFileId) { throw new Error('fileId is required (or set FIGMA_FILE_ID)'); }
  const data = await figma.getVersions(targetFileId);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.getTeamInfo', 'Get information about a Figma team', {
  teamId: z.string(),
}, async ({ teamId }) => {
  const data = await figma.getTeamInfo(teamId);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.tool('figma.listTeamFiles', 'List all files in a Figma team', {
  teamId: z.string(),
}, async ({ teamId }) => {
  const data = await figma.listTeamFiles(teamId);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

// OAuth tools (only available if OAuth is configured)
if (oauthClient) {
  server.tool('figma.oauth.generateAuthUrl', 'Generate OAuth authorization URL', {}, async () => {
    const authData = await oauthClient.generateAuthUrl();
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          authUrl: authData.url,
          codeVerifier: authData.codeVerifier,
          state: authData.state,
          instructions: 'Visit the authUrl in your browser to authorize the app. Save the codeVerifier and state for the next step.'
        }) 
      }] 
    };
  });

  server.tool('figma.oauth.exchangeCode', 'Exchange authorization code for access token', {
    code: z.string(),
    codeVerifier: z.string(),
    state: z.string(),
  }, async ({ code, codeVerifier, state }) => {
    const tokens = await oauthClient.exchangeCodeForToken(code, codeVerifier, state);
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
          tokenType: tokens.token_type,
          instructions: 'Use the accessToken as your FIGMA_TOKEN in future requests.'
        }) 
      }] 
    };
  });

  server.tool('figma.oauth.refreshToken', 'Refresh access token using refresh token', {
    refreshToken: z.string(),
  }, async ({ refreshToken }) => {
    const tokens = await oauthClient.refreshToken(refreshToken);
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
          tokenType: tokens.token_type
        }) 
      }] 
    };
  });

  server.tool('figma.oauth.getConfig', 'Get OAuth configuration for client setup', {}, async () => {
    const config = oauthClient.getConfig();
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          ...config,
          instructions: 'Use these values to configure your Figma OAuth app.'
        }) 
      }] 
    };
  });
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
