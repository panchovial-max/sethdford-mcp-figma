# sethdford-mcp-figma

MCP server for interacting with Figma files via Figma REST API.

## Quickstart
1. Copy .env.example to .env and set FIGMA_TOKEN.
2. Install deps: npm install
3. Dev: npm run dev
4. Build: npm run build && npm start

## Tools
- figma.getFile(fileId)
- figma.searchNodes(fileId, query)

## Env
- FIGMA_TOKEN: Personal Access Token from Figma
- FIGMA_FILE_ID: Optional default file ID

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
