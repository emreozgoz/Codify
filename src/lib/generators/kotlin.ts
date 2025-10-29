// src/lib/generators/kotlin.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class KotlinOkHttpGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    // Build full URL with query params
    const fullUrl = this.buildUrl(url, queryParams);

    let code = `// ${request.name}\n`;
    code += `import okhttp3.*\n`;
    code += `import okhttp3.MediaType.Companion.toMediaType\n`;
    code += `import okhttp3.RequestBody.Companion.toRequestBody\n`;
    code += `import java.io.IOException\n`;
    code += `import java.util.concurrent.TimeUnit\n\n`;

    code += `fun main() {\n`;
    code += `    val client = OkHttpClient.Builder()\n`;
    code += `        .connectTimeout(30, TimeUnit.SECONDS)\n`;
    code += `        .readTimeout(30, TimeUnit.SECONDS)\n`;
    code += `        .build()\n\n`;

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

    // Request body
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        const jsonStr = JSON.stringify(body.content);
        code += `    val mediaType = "application/json; charset=utf-8".toMediaType()\n`;
        code += `    val requestBody = """\n`;
        code += `        ${jsonStr}\n`;
        code += `    """.trimIndent().toRequestBody(mediaType)\n\n`;
      } else if (body.type === 'urlencoded') {
        code += `    val formBody = FormBody.Builder()\n`;
        Object.entries(body.content).forEach(([key, value]) => {
          code += `        .add("${key}", "${value}")\n`;
        });
        code += `        .build()\n\n`;
      }
    }

    // Build request
    code += `    val request = Request.Builder()\n`;
    code += `        .url("${fullUrl}")\n`;

    // Headers
    Object.entries(allHeaders).forEach(([key, value]) => {
      code += `        .addHeader("${key}", "${value}")\n`;
    });

    // Method and body
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        code += `        .${method.toLowerCase()}(requestBody)\n`;
      } else if (body.type === 'urlencoded') {
        code += `        .${method.toLowerCase()}(formBody)\n`;
      } else {
        code += `        .${method.toLowerCase()}(requestBody)\n`;
      }
    } else {
      if (method === 'GET') {
        code += `        .get()\n`;
      } else if (method === 'DELETE') {
        code += `        .delete()\n`;
      } else if (method === 'HEAD') {
        code += `        .head()\n`;
      } else {
        code += `        .method("${method}", null)\n`;
      }
    }

    code += `        .build()\n\n`;

    // Execute request
    code += `    try {\n`;
    code += `        client.newCall(request).execute().use { response ->\n`;
    code += `            if (!response.isSuccessful) {\n`;
    code += `                println("Error: \${response.code} \${response.message}")\n`;
    code += `                return@use\n`;
    code += `            }\n\n`;

    code += `            println("Status Code: \${response.code}")\n`;
    code += `            println("Response: \${response.body?.string()}")\n`;
    code += `        }\n`;
    code += `    } catch (e: IOException) {\n`;
    code += `        println("Network error: \${e.message}")\n`;
    code += `        e.printStackTrace()\n`;
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
    return 'kt';
  }

  getName(): string {
    return 'Kotlin (OkHttp)';
  }
}
