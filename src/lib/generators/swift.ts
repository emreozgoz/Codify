// src/lib/generators/swift.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class SwiftURLSessionGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    // Build full URL with query params
    const fullUrl = this.buildUrl(url, queryParams);

    let code = `// ${request.name}\n`;
    code += `import Foundation\n\n`;

    code += `func makeRequest() {\n`;
    code += `    guard let url = URL(string: "${fullUrl}") else {\n`;
    code += `        print("Invalid URL")\n`;
    code += `        return\n`;
    code += `    }\n\n`;

    code += `    var request = URLRequest(url: url)\n`;
    code += `    request.httpMethod = "${method}"\n`;
    code += `    request.timeoutInterval = 30\n\n`;

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

    if (Object.keys(allHeaders).length > 0) {
      code += `    // Headers\n`;
      Object.entries(allHeaders).forEach(([key, value]) => {
        code += `    request.setValue("${value}", forHTTPHeaderField: "${key}")\n`;
      });
      code += `\n`;
    }

    // Body
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        code += `    // Request body\n`;
        code += `    let requestBody: [String: Any] = [\n`;
        Object.entries(body.content).forEach(([key, value], idx, arr) => {
          const formattedValue = typeof value === 'string'
            ? `"${value}"`
            : typeof value === 'object' && value !== null
              ? this.formatSwiftDict(value)
              : value;
          code += `        "${key}": ${formattedValue}${idx < arr.length - 1 ? ',' : ''}\n`;
        });
        code += `    ]\n\n`;
        code += `    do {\n`;
        code += `        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)\n`;
        code += `    } catch {\n`;
        code += `        print("Error serializing JSON: \\(error)")\n`;
        code += `        return\n`;
        code += `    }\n\n`;
      } else if (body.type === 'urlencoded') {
        code += `    // Form data\n`;
        const formData = Object.entries(body.content)
          .map(([k, v]) => `${k}=${v}`)
          .join('&');
        code += `    request.httpBody = "${formData}".data(using: .utf8)\n`;
        code += `    request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")\n\n`;
      }
    }

    // Execute request
    code += `    // Execute request\n`;
    code += `    let task = URLSession.shared.dataTask(with: request) { data, response, error in\n`;
    code += `        if let error = error {\n`;
    code += `            print("Error: \\(error.localizedDescription)")\n`;
    code += `            return\n`;
    code += `        }\n\n`;

    code += `        guard let httpResponse = response as? HTTPURLResponse else {\n`;
    code += `            print("Invalid response")\n`;
    code += `            return\n`;
    code += `        }\n\n`;

    code += `        print("Status Code: \\(httpResponse.statusCode)")\n\n`;

    code += `        if let data = data,\n`;
    code += `           let responseString = String(data: data, encoding: .utf8) {\n`;
    code += `            print("Response: \\(responseString)")\n\n`;

    code += `            // Parse JSON response\n`;
    code += `            do {\n`;
    code += `                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {\n`;
    code += `                    print("Parsed JSON: \\(json)")\n`;
    code += `                }\n`;
    code += `            } catch {\n`;
    code += `                print("JSON parsing error: \\(error)")\n`;
    code += `            }\n`;
    code += `        }\n`;
    code += `    }\n\n`;

    code += `    task.resume()\n`;
    code += `}\n\n`;

    code += `// Execute\n`;
    code += `makeRequest()\n\n`;
    code += `// Keep the playground running\n`;
    code += `import PlaygroundSupport\n`;
    code += `PlaygroundPage.current.needsIndefiniteExecution = true`;

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

  private formatSwiftDict(obj: any): string {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '[:]';

    const items = entries.map(([key, value]) => {
      const formattedValue = typeof value === 'string'
        ? `"${value}"`
        : value;
      return `"${key}": ${formattedValue}`;
    });

    return `[${items.join(', ')}]`;
  }

  getFileExtension(): string {
    return 'swift';
  }

  getName(): string {
    return 'Swift (URLSession)';
  }
}
