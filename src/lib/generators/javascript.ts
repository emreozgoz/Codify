// src/lib/generators/javascript.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class JavaScriptFetchGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    // URL with query params
    const fullUrl = this.buildUrl(url, queryParams);

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

    let code = `// ${request.name}\n`;
    code += `const url = '${fullUrl}';\n\n`;

    if (Object.keys(allHeaders).length > 0) {
      code += `const headers = ${this.formatObject(allHeaders)};\n\n`;
    }

    code += `const options = {\n`;
    code += `  method: '${method}'`;

    if (Object.keys(allHeaders).length > 0) {
      code += `,\n  headers: headers`;
    }

    if (body && method !== 'GET') {
      if (body.type === 'json') {
        code += `,\n  body: JSON.stringify(${this.formatObject(body.content, 2)})`;
      } else if (body.type === 'urlencoded') {
        code += `,\n  body: new URLSearchParams(${this.formatObject(body.content, 2)})`;
      } else {
        code += `,\n  body: ${JSON.stringify(body.content)}`;
      }
    }

    code += `\n};\n\n`;

    code += `fetch(url, options)\n`;
    code += `  .then(response => {\n`;
    code += `    if (!response.ok) {\n`;
    code += `      throw new Error(\`HTTP error! status: \${response.status}\`);\n`;
    code += `    }\n`;
    code += `    return response.json();\n`;
    code += `  })\n`;
    code += `  .then(data => {\n`;
    code += `    console.log('Success:', data);\n`;
    code += `  })\n`;
    code += `  .catch(error => {\n`;
    code += `    console.error('Error:', error);\n`;
    code += `  });`;

    return code;
  }

  private buildUrl(baseUrl: string, queryParams: Record<string, string>): string {
    const params = Object.entries(queryParams);
    if (params.length === 0) return baseUrl;

    const queryString = params
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return `${baseUrl}?${queryString}`;
  }

  private formatObject(obj: any, indent: number = 1): string {
    const indentStr = '  '.repeat(indent);
    const entries = Object.entries(obj);

    if (entries.length === 0) return '{}';

    const lines = entries.map(([key, value]) => {
      const formattedValue = typeof value === 'string'
        ? `'${value}'`
        : JSON.stringify(value);
      return `${indentStr}'${key}': ${formattedValue}`;
    });

    return `{\n${lines.join(',\n')}\n${'  '.repeat(indent - 1)}}`;
  }

  getFileExtension(): string {
    return 'js';
  }

  getName(): string {
    return 'JavaScript (Fetch)';
  }
}
