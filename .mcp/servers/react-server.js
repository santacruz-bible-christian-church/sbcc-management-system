#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve from project root
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const FRONTEND_PATH = process.env.FRONTEND_PATH || path.join(PROJECT_ROOT, 'frontend/src');

const server = new Server(
  {
    name: 'react-server',
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
    if (name === 'list_components') {
      const componentsPath = path.join(FRONTEND_PATH, 'components');
      const files = await fs.readdir(componentsPath, { recursive: true });
      
      const components = files
        .filter(file => file.endsWith('.jsx') || file.endsWith('.tsx'))
        .map(file => ({
          name: file,
          path: path.join(componentsPath, file),
        }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(components, null, 2),
          },
        ],
      };
    }

    if (name === 'get_component') {
      const { component_name } = args;
      const componentsPath = path.join(FRONTEND_PATH, 'components');
      const componentPath = path.join(componentsPath, component_name);
      
      const content = await fs.readFile(componentPath, 'utf-8');

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    }

    if (name === 'list_pages') {
      const pagesPath = path.join(FRONTEND_PATH, 'pages');
      const files = await fs.readdir(pagesPath, { recursive: true });
      
      const pages = files
        .filter(file => file.endsWith('.jsx') || file.endsWith('.tsx'))
        .map(file => ({
          name: file,
          path: path.join(pagesPath, file),
        }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(pages, null, 2),
          },
        ],
      };
    }

    if (name === 'analyze_imports') {
      const { file_path } = args;
      const content = await fs.readFile(file_path, 'utf-8');
      
      // Extract imports
      const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*)?)+\s+from\s+['"]([^'"]+)['"]/g;
      const imports = [];
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              file: file_path,
              imports: imports,
              count: imports.length,
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'check_package_json') {
      const packagePath = path.join('./frontend', 'package.json');
      const content = await fs.readFile(packagePath, 'utf-8');
      const pkg = JSON.parse(content);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              name: pkg.name,
              version: pkg.version,
              dependencies: pkg.dependencies,
              devDependencies: pkg.devDependencies,
              scripts: pkg.scripts,
            }, null, 2),
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
        name: 'list_components',
        description: 'List all React components in the frontend/src/components directory',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_component',
        description: 'Get the source code of a specific React component',
        inputSchema: {
          type: 'object',
          properties: {
            component_name: {
              type: 'string',
              description: 'Name of the component file (e.g., "Header.jsx")',
            },
          },
          required: ['component_name'],
        },
      },
      {
        name: 'list_pages',
        description: 'List all pages in the frontend/src/pages directory',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'analyze_imports',
        description: 'Analyze imports in a React file to understand dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Path to the React file to analyze',
            },
          },
          required: ['file_path'],
        },
      },
      {
        name: 'check_package_json',
        description: 'Check frontend package.json for dependencies and scripts',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('React MCP server running on stdio');