// src/lib/generators/python.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class PythonGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    let code = `# ${request.name}\n`;
    code += `import requests\n`;
    code += `import json\n\n`;

    code += `url = "${url}"\n\n`;

    // Query params
    if (Object.keys(queryParams).length > 0) {
      code += `params = ${this.formatPythonDict(queryParams)}\n\n`;
    }

    // Headers
    const allHeaders = { ...headers };
    if (auth?.type === 'bearer') {
      allHeaders['Authorization'] = `Bearer ${auth.token}`;
    }

    if (Object.keys(allHeaders).length > 0) {
      code += `headers = ${this.formatPythonDict(allHeaders)}\n\n`;
    }

    // Body
    if (body && method !== 'GET') {
      if (body.type === 'json') {
        code += `data = ${this.formatPythonDict(body.content)}\n\n`;
      }
    }

    // Request
    code += `try:\n`;
    code += `    response = requests.${method.toLowerCase()}(\n`;
    code += `        url`;

    if (Object.keys(queryParams).length > 0) {
      code += `,\n        params=params`;
    }

    if (Object.keys(allHeaders).length > 0) {
      code += `,\n        headers=headers`;
    }

    if (body && method !== 'GET') {
      if (body.type === 'json') {
        code += `,\n        json=data`;
      }
    }

    code += `\n    )\n`;
    code += `    response.raise_for_status()\n`;
    code += `    \n`;
    code += `    print("Success:", response.json())\n`;
    code += `    \n`;
    code += `except requests.exceptions.RequestException as e:\n`;
    code += `    print(f"Error: {e}")`;

    return code;
  }

  private formatPythonDict(obj: any, indent: number = 0): string {
    const indentStr = '    ' + '    '.repeat(indent);
    const entries = Object.entries(obj);

    if (entries.length === 0) return '{}';

    const lines = entries.map(([key, value]) => {
      const formattedValue = typeof value === 'string'
        ? `"${value}"`
        : JSON.stringify(value);
      return `${indentStr}"${key}": ${formattedValue}`;
    });

    return `{\n${lines.join(',\n')}\n}`;
  }

  getFileExtension(): string {
    return 'py';
  }

  getName(): string {
    return 'Python (Requests)';
  }
}
