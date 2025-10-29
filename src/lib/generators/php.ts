// src/lib/generators/php.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class PhpCurlGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    // Build full URL with query params
    const fullUrl = this.buildUrl(url, queryParams);

    let code = `<?php\n`;
    code += `// ${request.name}\n\n`;

    code += `$curl = curl_init();\n\n`;

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

    // Options array
    code += `$options = [\n`;
    code += `    CURLOPT_URL => '${fullUrl}',\n`;
    code += `    CURLOPT_RETURNTRANSFER => true,\n`;
    code += `    CURLOPT_ENCODING => '',\n`;
    code += `    CURLOPT_MAXREDIRS => 10,\n`;
    code += `    CURLOPT_TIMEOUT => 30,\n`;
    code += `    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n`;
    code += `    CURLOPT_CUSTOMREQUEST => '${method}',\n`;

    // Body
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        const jsonStr = JSON.stringify(body.content, null, 4)
          .split('\n')
          .map(line => '        ' + line)
          .join('\n');
        code += `    CURLOPT_POSTFIELDS => json_encode([\n${jsonStr}\n    ]),\n`;
      } else if (body.type === 'urlencoded') {
        code += `    CURLOPT_POSTFIELDS => http_build_query(${this.formatPhpArray(body.content)}),\n`;
      } else {
        code += `    CURLOPT_POSTFIELDS => '${JSON.stringify(body.content)}',\n`;
      }
    }

    // Headers
    if (Object.keys(allHeaders).length > 0) {
      code += `    CURLOPT_HTTPHEADER => [\n`;
      Object.entries(allHeaders).forEach(([key, value]) => {
        code += `        '${key}: ${value}',\n`;
      });
      code += `    ],\n`;
    }

    code += `];\n\n`;

    code += `curl_setopt_array($curl, $options);\n\n`;

    code += `$response = curl_exec($curl);\n`;
    code += `$error = curl_error($curl);\n`;
    code += `$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);\n\n`;

    code += `curl_close($curl);\n\n`;

    code += `if ($error) {\n`;
    code += `    echo "cURL Error: " . $error . "\\n";\n`;
    code += `} else {\n`;
    code += `    echo "HTTP Code: " . $httpCode . "\\n";\n`;
    code += `    echo "Response: " . $response . "\\n";\n`;
    code += `    \n`;
    code += `    // Parse JSON response\n`;
    code += `    $data = json_decode($response, true);\n`;
    code += `    print_r($data);\n`;
    code += `}\n`;
    code += `?>`;

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

  private formatPhpArray(obj: any): string {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '[]';

    const lines = entries.map(([key, value]) => {
      const formattedValue = typeof value === 'string'
        ? `'${value}'`
        : JSON.stringify(value);
      return `        '${key}' => ${formattedValue}`;
    });

    return `[\n${lines.join(',\n')}\n    ]`;
  }

  getFileExtension(): string {
    return 'php';
  }

  getName(): string {
    return 'PHP (cURL)';
  }
}
