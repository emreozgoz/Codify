// src/lib/generators/nodejs.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class NodeJsAxiosGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    let code = `// ${request.name}\n`;
    code += `const axios = require('axios');\n\n`;

    // Headers
    const allHeaders = { ...headers };
    if (auth?.type === 'bearer') {
      allHeaders['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth?.type === 'apikey' && auth.apiKey) {
      allHeaders[auth.apiKey] = auth.apiValue || '';
    }

    if (body?.type === 'json') {
      allHeaders['Content-Type'] = 'application/json';
    }

    // Config object
    code += `const config = {\n`;
    code += `  method: '${method.toLowerCase()}',\n`;
    code += `  url: '${url}'`;

    // Query params
    if (Object.keys(queryParams).length > 0) {
      code += `,\n  params: ${this.formatObject(queryParams, 2)}`;
    }

    // Headers
    if (Object.keys(allHeaders).length > 0) {
      code += `,\n  headers: ${this.formatObject(allHeaders, 2)}`;
    }

    // Body
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        code += `,\n  data: ${this.formatObject(body.content, 2)}`;
      } else if (body.type === 'urlencoded') {
        code += `,\n  data: new URLSearchParams(${this.formatObject(body.content, 2)})`;
      } else {
        code += `,\n  data: ${JSON.stringify(body.content)}`;
      }
    }

    code += `\n};\n\n`;

    // Request execution
    code += `axios(config)\n`;
    code += `  .then(response => {\n`;
    code += `    console.log('Status:', response.status);\n`;
    code += `    console.log('Data:', response.data);\n`;
    code += `  })\n`;
    code += `  .catch(error => {\n`;
    code += `    if (error.response) {\n`;
    code += `      console.error('Error:', error.response.status, error.response.data);\n`;
    code += `    } else {\n`;
    code += `      console.error('Error:', error.message);\n`;
    code += `    }\n`;
    code += `  });`;

    return code;
  }

  private formatObject(obj: any, indent: number = 1): string {
    const indentStr = '  '.repeat(indent);
    const entries = Object.entries(obj);

    if (entries.length === 0) return '{}';

    const lines = entries.map(([key, value]) => {
      const formattedValue = typeof value === 'string'
        ? `'${value}'`
        : JSON.stringify(value);
      return `${indentStr}${key}: ${formattedValue}`;
    });

    return `{\n${lines.join(',\n')}\n${'  '.repeat(indent - 1)}}`;
  }

  getFileExtension(): string {
    return 'js';
  }

  getName(): string {
    return 'Node.js (Axios)';
  }
}
