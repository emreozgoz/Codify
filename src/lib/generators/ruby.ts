// src/lib/generators/ruby.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class RubyHTTPartyGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    let code = `# ${request.name}\n`;
    code += `require 'httparty'\n`;
    code += `require 'json'\n\n`;

    code += `class ApiClient\n`;
    code += `  include HTTParty\n`;
    code += `  base_uri '${this.extractBaseUri(url)}'\n\n`;

    code += `  def self.make_request\n`;

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

    // Options hash
    code += `    options = {\n`;

    // Headers
    if (Object.keys(allHeaders).length > 0) {
      code += `      headers: {\n`;
      Object.entries(allHeaders).forEach(([key, value]) => {
        code += `        '${key}' => '${value}',\n`;
      });
      code += `      },\n`;
    }

    // Query params
    if (Object.keys(queryParams).length > 0) {
      code += `      query: {\n`;
      Object.entries(queryParams).forEach(([key, value]) => {
        code += `        ${key}: '${value}',\n`;
      });
      code += `      },\n`;
    }

    // Body
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        code += `      body: {\n`;
        this.formatRubyHash(body.content, 8).forEach(line => {
          code += line + '\n';
        });
        code += `      }.to_json,\n`;
      } else if (body.type === 'urlencoded') {
        code += `      body: {\n`;
        Object.entries(body.content).forEach(([key, value]) => {
          code += `        ${key}: '${value}',\n`;
        });
        code += `      },\n`;
      }
    }

    code += `    }\n\n`;

    // Make request
    const path = this.extractPath(url);
    const methodLower = method.toLowerCase();
    code += `    response = ${methodLower}('${path}', options)\n\n`;

    code += `    if response.success?\n`;
    code += `      puts "Status: #{response.code}"\n`;
    code += `      puts "Response: #{response.body}"\n`;
    code += `      response.parsed_response\n`;
    code += `    else\n`;
    code += `      puts "Error: #{response.code} - #{response.message}"\n`;
    code += `      nil\n`;
    code += `    end\n`;
    code += `  rescue StandardError => e\n`;
    code += `    puts "Exception: #{e.message}"\n`;
    code += `    nil\n`;
    code += `  end\n`;
    code += `end\n\n`;

    code += `# Execute request\n`;
    code += `ApiClient.make_request`;

    return code;
  }

  private extractBaseUri(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return 'https://api.example.com';
    }
  }

  private extractPath(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname || '/';
    } catch {
      return '/';
    }
  }

  private formatRubyHash(obj: any, indent: number): string[] {
    const indentStr = ' '.repeat(indent);
    const lines: string[] = [];

    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        lines.push(`${indentStr}${key}: {`);
        this.formatRubyHash(value, indent + 2).forEach(line => lines.push(line));
        lines.push(`${indentStr}},`);
      } else if (Array.isArray(value)) {
        lines.push(`${indentStr}${key}: [${value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ')}],`);
      } else if (typeof value === 'string') {
        lines.push(`${indentStr}${key}: '${value}',`);
      } else {
        lines.push(`${indentStr}${key}: ${value},`);
      }
    });

    return lines;
  }

  getFileExtension(): string {
    return 'rb';
  }

  getName(): string {
    return 'Ruby (HTTParty)';
  }
}
