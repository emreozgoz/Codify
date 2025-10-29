// src/lib/generators/curl.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class CurlGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    // Build full URL with query params
    const fullUrl = this.buildUrl(url, queryParams);

    let code = `# ${request.name}\n`;
    code += `curl -X ${method} '${fullUrl}'`;

    // Headers
    const allHeaders = { ...headers };
    if (auth?.type === 'bearer') {
      allHeaders['Authorization'] = `Bearer ${auth.token}`;
    }

    Object.entries(allHeaders).forEach(([key, value]) => {
      code += ` \\\n  -H '${key}: ${value}'`;
    });

    // Body
    if (body && method !== 'GET') {
      if (body.type === 'json') {
        const jsonStr = JSON.stringify(body.content);
        code += ` \\\n  -d '${jsonStr}'`;
      } else if (body.type === 'urlencoded') {
        Object.entries(body.content).forEach(([key, value]) => {
          code += ` \\\n  -d '${key}=${value}'`;
        });
      }
    }

    return code;
  }

  private buildUrl(baseUrl: string, queryParams: Record<string, string>): string {
    const params = Object.entries(queryParams);
    if (params.length === 0) return baseUrl;

    const queryString = params
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return `${baseUrl}?${queryString}`;
  }

  getFileExtension(): string {
    return 'sh';
  }

  getName(): string {
    return 'cURL';
  }
}
