// src/lib/generators/csharp.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class CSharpHttpClientGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    // Build full URL with query params
    const fullUrl = this.buildUrl(url, queryParams);

    let code = `// ${request.name}\n`;
    code += `using System;\n`;
    code += `using System.Net.Http;\n`;
    code += `using System.Text;\n`;
    code += `using System.Threading.Tasks;\n`;
    code += `using System.Text.Json;\n\n`;

    code += `namespace ApiClient\n`;
    code += `{\n`;
    code += `    class Program\n`;
    code += `    {\n`;
    code += `        static async Task Main(string[] args)\n`;
    code += `        {\n`;
    code += `            using var client = new HttpClient();\n`;
    code += `            client.Timeout = TimeSpan.FromSeconds(30);\n\n`;

    // Headers
    const allHeaders = { ...headers };
    if (auth?.type === 'bearer') {
      allHeaders['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth?.type === 'apikey' && auth.apiKey) {
      allHeaders[auth.apiKey] = auth.apiValue || '';
    }

    Object.entries(allHeaders).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type') {
        code += `            client.DefaultRequestHeaders.Add("${key}", "${value}");\n`;
      }
    });

    if (Object.keys(allHeaders).length > 0) {
      code += `\n`;
    }

    code += `            try\n`;
    code += `            {\n`;

    // Request
    const methodCapital = method.charAt(0) + method.slice(1).toLowerCase();

    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        code += `                var requestData = new\n`;
        code += `                {\n`;
        Object.entries(body.content).forEach(([key, value], idx, arr) => {
          const formattedValue = typeof value === 'string'
            ? `"${value}"`
            : typeof value === 'object' && value !== null
              ? `new { ${Object.entries(value).map(([k, v]) => `${k} = ${typeof v === 'string' ? `"${v}"` : v}`).join(', ')} }`
              : value;
          code += `                    ${key} = ${formattedValue}${idx < arr.length - 1 ? ',' : ''}\n`;
        });
        code += `                };\n\n`;
        code += `                var jsonContent = JsonSerializer.Serialize(requestData);\n`;
        code += `                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");\n\n`;
        code += `                var response = await client.${methodCapital}Async("${fullUrl}", content);\n`;
      } else if (body.type === 'urlencoded') {
        code += `                var formData = new Dictionary<string, string>\n`;
        code += `                {\n`;
        Object.entries(body.content).forEach(([key, value], idx, arr) => {
          code += `                    { "${key}", "${value}" }${idx < arr.length - 1 ? ',' : ''}\n`;
        });
        code += `                };\n\n`;
        code += `                var content = new FormUrlEncodedContent(formData);\n\n`;
        code += `                var response = await client.${methodCapital}Async("${fullUrl}", content);\n`;
      } else {
        code += `                var content = new StringContent("${body.content}", Encoding.UTF8);\n\n`;
        code += `                var response = await client.${methodCapital}Async("${fullUrl}", content);\n`;
      }
    } else {
      code += `                var response = await client.${methodCapital}Async("${fullUrl}");\n`;
    }

    code += `\n`;
    code += `                response.EnsureSuccessStatusCode();\n`;
    code += `                var responseBody = await response.Content.ReadAsStringAsync();\n\n`;

    code += `                Console.WriteLine($"Status Code: {(int)response.StatusCode}");\n`;
    code += `                Console.WriteLine($"Response: {responseBody}");\n`;
    code += `            }\n`;
    code += `            catch (HttpRequestException e)\n`;
    code += `            {\n`;
    code += `                Console.WriteLine($"Error: {e.Message}");\n`;
    code += `            }\n`;
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
    return 'cs';
  }

  getName(): string {
    return 'C# (HttpClient)';
  }
}
