// src/lib/generators/rust.ts

import { NormalizedRequest } from '@/lib/types/request.types';
import { CodeGenerator } from '@/lib/types/generator.types';

export class RustReqwestGenerator implements CodeGenerator {
  generate(request: NormalizedRequest): string {
    const { method, url, headers, queryParams, body, auth } = request;

    let code = `// ${request.name}\n`;
    code += `use reqwest;\n`;
    code += `use serde_json::json;\n`;
    code += `use std::collections::HashMap;\n`;
    code += `use std::time::Duration;\n\n`;

    code += `#[tokio::main]\n`;
    code += `async fn main() -> Result<(), Box<dyn std::error::Error>> {\n`;
    code += `    let client = reqwest::Client::builder()\n`;
    code += `        .timeout(Duration::from_secs(30))\n`;
    code += `        .build()?;\n\n`;

    // URL and query params
    code += `    let url = "${url}";\n`;

    if (Object.keys(queryParams).length > 0) {
      code += `\n    let mut params = HashMap::new();\n`;
      Object.entries(queryParams).forEach(([key, value]) => {
        code += `    params.insert("${key}", "${value}");\n`;
      });
      code += `\n`;
    }

    // Build request
    code += `    let mut request = client.${method.toLowerCase()}(url)`;

    // Query params
    if (Object.keys(queryParams).length > 0) {
      code += `\n        .query(&params)`;
    }

    // Headers
    const allHeaders = { ...headers };
    if (auth?.type === 'bearer') {
      allHeaders['Authorization'] = `Bearer ${auth.token}`;
    } else if (auth?.type === 'apikey' && auth.apiKey) {
      allHeaders[auth.apiKey] = auth.apiValue || '';
    }

    Object.entries(allHeaders).forEach(([key, value]) => {
      code += `\n        .header("${key}", "${value}")`;
    });

    // Body
    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body.type === 'json') {
        code += `\n        .json(&json!(${this.formatRustJson(body.content)}))`;
      } else if (body.type === 'urlencoded') {
        code += `;\n\n    let mut form = HashMap::new();\n`;
        Object.entries(body.content).forEach(([key, value]) => {
          code += `    form.insert("${key}", "${value}");\n`;
        });
        code += `\n    let request = request.form(&form)`;
      }
    }

    code += `;\n\n`;

    // Execute request
    code += `    match request.send().await {\n`;
    code += `        Ok(response) => {\n`;
    code += `            println!("Status: {}", response.status());\n\n`;

    code += `            match response.text().await {\n`;
    code += `                Ok(body) => {\n`;
    code += `                    println!("Response: {}", body);\n`;
    code += `                }\n`;
    code += `                Err(e) => {\n`;
    code += `                    eprintln!("Error reading response: {}", e);\n`;
    code += `                }\n`;
    code += `            }\n`;
    code += `        }\n`;
    code += `        Err(e) => {\n`;
    code += `            eprintln!("Request error: {}", e);\n`;
    code += `        }\n`;
    code += `    }\n\n`;

    code += `    Ok(())\n`;
    code += `}\n\n`;

    // Cargo.toml dependencies
    code += `/*\nAdd to Cargo.toml:\n\n`;
    code += `[dependencies]\n`;
    code += `reqwest = { version = "0.11", features = ["json"] }\n`;
    code += `tokio = { version = "1", features = ["full"] }\n`;
    code += `serde_json = "1.0"\n`;
    code += `*/`;

    return code;
  }

  private formatRustJson(obj: any, indent: number = 0): string {
    const indentStr = '    '.repeat(indent);

    if (Array.isArray(obj)) {
      const items = obj.map(item =>
        typeof item === 'string' ? `"${item}"` : this.formatRustJson(item, indent + 1)
      ).join(', ');
      return `[${items}]`;
    }

    if (typeof obj === 'object' && obj !== null) {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '{}';

      const lines = entries.map(([key, value]) => {
        const formattedValue = typeof value === 'string'
          ? `"${value}"`
          : typeof value === 'number' || typeof value === 'boolean'
            ? value
            : this.formatRustJson(value, indent + 1);
        return `\n${indentStr}    "${key}": ${formattedValue}`;
      });

      return `{${lines.join(',')}\n${indentStr}}`;
    }

    return String(obj);
  }

  getFileExtension(): string {
    return 'rs';
  }

  getName(): string {
    return 'Rust (reqwest)';
  }
}
