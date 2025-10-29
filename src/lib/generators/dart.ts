// src/lib/generators/dart.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class DartDioGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    let code = `// ${request.name}\n`;
    code += `import 'package:dio/dio.dart';\n\n`;

    code += `void main() async {\n`;
    code += `  final dio = Dio(\n`;
    code += `    BaseOptions(\n`;
    code += `      connectTimeout: const Duration(seconds: 30),\n`;
    code += `      receiveTimeout: const Duration(seconds: 30),\n`;
    code += `    ),\n`;
    code += `  );\n\n`;

    // Headers
    const allHeaders = { ...headers };
    if (auth?.type === 'bearer') {
      allHeaders['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth?.type === 'apikey' && auth.apiKey) {
      allHeaders[auth.apiKey] = auth.apiValue || '';
    }

    if (Object.keys(allHeaders).length > 0) {
      code += `  final headers = {\n`;
      Object.entries(allHeaders).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += `  };\n\n`;
    }

    // Query params
    if (Object.keys(queryParams).length > 0) {
      code += `  final queryParams = {\n`;
      Object.entries(queryParams).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += `  };\n\n`;
    }

    // Body data
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        code += `  final data = ${this.formatDartMap(body.content)};\n\n`;
      } else if (body.type === 'urlencoded') {
        code += `  final data = FormData.fromMap({\n`;
        Object.entries(body.content).forEach(([key, value]) => {
          code += `    '${key}': '${value}',\n`;
        });
        code += `  });\n\n`;
      }
    }

    // Execute request
    code += `  try {\n`;
    code += `    final response = await dio.${method.toLowerCase()}(\n`;
    code += `      '${url}',\n`;

    // Options
    const options: string[] = [];

    if (Object.keys(queryParams).length > 0) {
      options.push('queryParameters: queryParams');
    }

    if (Object.keys(allHeaders).length > 0) {
      options.push('options: Options(headers: headers)');
    }

    if (body && method !== 'GET' && method !== 'HEAD') {
      options.push('data: data');
    }

    if (options.length > 0) {
      code += `      ${options.join(',\n      ')},\n`;
    }

    code += `    );\n\n`;

    code += `    print('Status Code: \${response.statusCode}');\n`;
    code += `    print('Response: \${response.data}');\n`;
    code += `  } on DioException catch (e) {\n`;
    code += `    if (e.response != null) {\n`;
    code += `      print('Error: \${e.response?.statusCode} - \${e.response?.data}');\n`;
    code += `    } else {\n`;
    code += `      print('Error: \${e.message}');\n`;
    code += `    }\n`;
    code += `  } catch (e) {\n`;
    code += `    print('Unexpected error: \$e');\n`;
    code += `  }\n`;
    code += `}\n\n`;

    // Pubspec.yaml dependencies
    code += `/*\nAdd to pubspec.yaml:\n\n`;
    code += `dependencies:\n`;
    code += `  dio: ^5.0.0\n`;
    code += `*/`;

    return code;
  }

  private formatDartMap(obj: any, indent: number = 2): string {
    const indentStr = ' '.repeat(indent);
    const entries = Object.entries(obj);

    if (entries.length === 0) return '{}';

    const lines: string[] = ['{'];

    entries.forEach(([key, value], idx) => {
      let formattedValue: string;

      if (typeof value === 'string') {
        formattedValue = `'${value}'`;
      } else if (Array.isArray(value)) {
        const items = value.map(v =>
          typeof v === 'string' ? `'${v}'` : JSON.stringify(v)
        ).join(', ');
        formattedValue = `[${items}]`;
      } else if (typeof value === 'object' && value !== null) {
        formattedValue = this.formatDartMap(value, indent + 2);
      } else {
        formattedValue = String(value);
      }

      const comma = idx < entries.length - 1 ? ',' : '';
      lines.push(`${indentStr}'${key}': ${formattedValue}${comma}`);
    });

    lines.push(' '.repeat(indent - 2) + '}');
    return lines.join('\n');
  }

  getFileExtension(): string {
    return 'dart';
  }

  getName(): string {
    return 'Dart (dio)';
  }
}
