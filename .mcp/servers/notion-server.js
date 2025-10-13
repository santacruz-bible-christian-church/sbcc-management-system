#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Client } from '@notionhq/client';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const NOTION_API_KEY = process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
  console.error('Error: NOTION_API_KEY environment variable is not set');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

const server = new Server(
  {
    name: 'notion-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'notion_search') {
      const { query } = args;
      const response = await notion.search({
        query,
        filter: { property: 'object', value: 'page' },
        page_size: 10,
      });

      const results = response.results.map((page) => ({
        id: page.id,
        title: page.properties?.Name?.title?.[0]?.plain_text || 
               page.properties?.title?.title?.[0]?.plain_text || 
               'Untitled',
        url: page.url,
        created: page.created_time,
        updated: page.last_edited_time,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    if (name === 'notion_get_page') {
      const { page_id } = args;
      const page = await notion.pages.retrieve({ page_id });
      
      // Get page content (blocks)
      const blocks = await notion.blocks.children.list({
        block_id: page_id,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                page: page,
                blocks: blocks.results,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === 'notion_get_database') {
      const { database_id } = args;
      const database = await notion.databases.retrieve({ database_id });
      
      // Get database entries
      const entries = await notion.databases.query({
        database_id,
        page_size: 20,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                database: database,
                entries: entries.results,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'notion_search',
        description: 'Search for Notion pages by query string',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (page title, content)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'notion_get_page',
        description: 'Get a Notion page by ID (including content blocks)',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'The Notion page ID (from URL or search)',
            },
          },
          required: ['page_id'],
        },
      },
      {
        name: 'notion_get_database',
        description: 'Get a Notion database and its entries',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'The Notion database ID',
            },
          },
          required: ['database_id'],
        },
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Notion MCP server running on stdio');