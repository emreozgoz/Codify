// src/lib/generators/java.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class JavaHttpClientGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    // Build full URL with query params
    const fullUrl = this.buildUrl(url, queryParams);

    let code = `// ${request.name}\n`;
    code += `import java.net.URI;\n`;
    code += `import java.net.http.HttpClient;\n`;
    code += `import java.net.http.HttpRequest;\n`;
    code += `import java.net.http.HttpResponse;\n`;
    code += `import java.time.Duration;\n\n`;

    code += `public class ApiRequest {\n`;
    code += `    public static void main(String[] args) {\n`;
    code += `        try {\n`;
    code += `            HttpClient client = HttpClient.newBuilder()\n`;
    code += `                .connectTimeout(Duration.ofSeconds(30))\n`;
    code += `                .build();\n\n`;

    // Request builder
    code += `            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()\n`;
    code += `                .uri(URI.create("${fullUrl}"))\n`;
    code += `                .timeout(Duration.ofSeconds(30))`;

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

    Object.entries(allHeaders).forEach(([key, value]) => {
      code += `\n                .header("${key}", "${value}")`;
    });

    // Body and method
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        const jsonStr = JSON.stringify(body.content)
          .replace(/"/g, '\\"');
        code += `\n                .${method}(HttpRequest.BodyPublishers.ofString("${jsonStr}"))`;
      } else if (body.type === 'urlencoded') {
        const formData = Object.entries(body.content)
          .map(([k, v]) => `${k}=${v}`)
          .join('&');
        code += `\n                .header("Content-Type", "application/x-www-form-urlencoded")`;
        code += `\n                .${method}(HttpRequest.BodyPublishers.ofString("${formData}"))`;
      } else {
        code += `\n                .${method}(HttpRequest.BodyPublishers.ofString("${body.content}"))`;
      }
    } else {
      code += `\n                .${method}()`;
    }

    code += `;\n\n`;

    code += `            HttpRequest request = requestBuilder.build();\n\n`;

    // Execute request
    code += `            HttpResponse<String> response = client.send(\n`;
    code += `                request,\n`;
    code += `                HttpResponse.BodyHandlers.ofString()\n`;
    code += `            );\n\n`;

    code += `            System.out.println("Status Code: " + response.statusCode());\n`;
    code += `            System.out.println("Response Body: " + response.body());\n\n`;

    // Error handling
    code += `        } catch (Exception e) {\n`;
    code += `            System.err.println("Error: " + e.getMessage());\n`;
    code += `            e.printStackTrace();\n`;
    code += `        }\n`;
    code += `    }\n`;
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
    return 'java';
  }

  getName(): string {
    return 'Java (HttpClient)';
  }
}
