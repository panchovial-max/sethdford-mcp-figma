# sethdford-mcp-figma

MCP server for interacting with Figma files via Figma REST API.

## Quickstart
1. Copy .env.example to .env and set FIGMA_TOKEN.
2. Install deps: npm install
3. Dev: npm run dev
4. Build: npm run build && npm start

### OAuth Setup (Optional)
1. Create a Figma OAuth app at https://www.figma.com/developers/oauth
2. Set FIGMA_CLIENT_ID and FIGMA_CLIENT_SECRET in .env
3. Use OAuth tools to authenticate instead of Personal Access Token

## Tools
- figma.getFile(fileId)
- figma.searchNodes(fileId, query)
- figma.getNodeImages(fileId?, nodeIds[], format?)
- figma.listTeamProjects(teamId)
- figma.listProjectFiles(projectId)
- figma.getMe()
- figma.getNodeThumbnail(fileId?, nodeId, format?, scale?)
- figma.getFileImage(fileId?, format?, scale?)
- figma.getComments(fileId?)
- figma.getVersions(fileId?)
- figma.getTeamInfo(teamId)
- figma.listTeamFiles(teamId)

## Env
- FIGMA_TOKEN: Personal Access Token from Figma
- FIGMA_FILE_ID: Optional default file ID

### OAuth Configuration (Optional)
- FIGMA_CLIENT_ID: OAuth client ID from Figma app
- FIGMA_CLIENT_SECRET: OAuth client secret from Figma app  
- FIGMA_REDIRECT_URI: OAuth redirect URI (default: http://localhost:3000/oauth/callback)
- OAUTH_PORT: Port for OAuth callback server (default: 3000)

## Configuration (MCP)
Add to your client config to register this server. If using package.json-based config, this repo already adds an mcp.servers entry.



## Environment
- FIGMA_TOKEN required; create a Personal Access Token in Figma settings.
- FIGMA_FILE_ID optional default.

## Development
- Dev: npm run dev
- Build: npm run build
- Start: npm start

## Additional Tools
- figma.getNodeImages(fileId?, nodeIds[], format?)
- figma.listTeamProjects(teamId)
- figma.listProjectFiles(projectId)
- figma.getMe()
- figma.getNodeThumbnail(fileId?, nodeId, format?, scale?)
- figma.getFileImage(fileId?, format?, scale?)
- figma.getComments(fileId?)
- figma.getVersions(fileId?)
- figma.getTeamInfo(teamId)
- figma.listTeamFiles(teamId)

### OAuth Tools (if OAuth configured)
- figma.oauth.generateAuthUrl()
- figma.oauth.exchangeCode(code, codeVerifier, state)
- figma.oauth.refreshToken(refreshToken)
- figma.oauth.getConfig()
