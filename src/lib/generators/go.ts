// src/lib/generators/go.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class GoHttpGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    // Build full URL with query params
    const fullUrl = this.buildUrl(url, queryParams);

    let code = `// ${request.name}\n`;
    code += `package main\n\n`;

    code += `import (\n`;
    code += `\t"bytes"\n`;
    code += `\t"fmt"\n`;
    code += `\t"io"\n`;
    code += `\t"net/http"\n`;
    code += `\t"time"\n`;
    code += `)\n\n`;

    code += `func main() {\n`;

    // Body
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        const jsonStr = JSON.stringify(body.content);
        code += `\tjsonData := []byte(\`${jsonStr}\`)\n`;
        code += `\treqBody := bytes.NewBuffer(jsonData)\n\n`;
        code += `\treq, err := http.NewRequest("${method}", "${fullUrl}", reqBody)\n`;
      } else if (body.type === 'urlencoded') {
        const formData = Object.entries(body.content)
          .map(([k, v]) => `${k}=${v}`)
          .join('&');
        code += `\tformData := []byte("${formData}")\n`;
        code += `\treqBody := bytes.NewBuffer(formData)\n\n`;
        code += `\treq, err := http.NewRequest("${method}", "${fullUrl}", reqBody)\n`;
      } else {
        code += `\treqBody := bytes.NewBufferString("${body.content}")\n\n`;
        code += `\treq, err := http.NewRequest("${method}", "${fullUrl}", reqBody)\n`;
      }
    } else {
      code += `\treq, err := http.NewRequest("${method}", "${fullUrl}", nil)\n`;
    }

    code += `\tif err != nil {\n`;
    code += `\t\tfmt.Println("Error creating request:", err)\n`;
    code += `\t\treturn\n`;
    code += `\t}\n\n`;

    // Headers
    const allHeaders = { ...headers };
    if (auth?.type === 'bearer') {
      allHeaders['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth?.type === 'apikey' && auth.apiKey) {
      allHeaders[auth.apiKey] = auth.apiValue || '';
    }

    if (body?.type === 'json') {
      allHeaders['Content-Type'] = 'application/json';
    } else if (body?.type === 'urlencoded') {
      allHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    Object.entries(allHeaders).forEach(([key, value]) => {
      code += `\treq.Header.Set("${key}", "${value}")\n`;
    });

    if (Object.keys(allHeaders).length > 0) {
      code += `\n`;
    }

    // Client
    code += `\tclient := &http.Client{\n`;
    code += `\t\tTimeout: 30 * time.Second,\n`;
    code += `\t}\n\n`;

    // Execute
    code += `\tresp, err := client.Do(req)\n`;
    code += `\tif err != nil {\n`;
    code += `\t\tfmt.Println("Error making request:", err)\n`;
    code += `\t\treturn\n`;
    code += `\t}\n`;
    code += `\tdefer resp.Body.Close()\n\n`;

    // Read response
    code += `\tbody, err := io.ReadAll(resp.Body)\n`;
    code += `\tif err != nil {\n`;
    code += `\t\tfmt.Println("Error reading response:", err)\n`;
    code += `\t\treturn\n`;
    code += `\t}\n\n`;

    code += `\tfmt.Println("Status Code:", resp.StatusCode)\n`;
    code += `\tfmt.Println("Response:", string(body))\n`;
    code += `}`;

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
    return 'go';
  }

  getName(): string {
    return 'Go (net/http)';
  }
}
