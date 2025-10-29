// src/lib/parsers/postmanParser.ts

import { PostmanCollection, PostmanRequest, PostmanUrl } from '@/lib/types/postman.types';
import { NormalizedRequest, RequestBody, RequestAuth } from '@/lib/types/request.types';

export class PostmanParser {
  parse(collection: PostmanCollection): NormalizedRequest[] {
    return collection.item.map((item, index) =>
      this.normalizeRequest(item.request, item.name, `req-${index}`)
    );
  }

  private normalizeRequest(
    request: PostmanRequest,
    name: string,
    id: string
  ): NormalizedRequest {
    return {
      id,
      name,
      method: request.method,
      url: this.extractUrl(request.url),
      headers: this.extractHeaders(request.header),
      queryParams: this.extractQueryParams(request.url),
      body: this.extractBody(request.body),
      auth: this.extractAuth(request.auth),
      description: request.description,
    };
  }

  private extractUrl(url: string | PostmanUrl): string {
    if (typeof url === 'string') return url;

    // PostmanUrl object'den URL oluştur
    const protocol = url.protocol || 'https';
    const host = url.host?.join('.') || 'api.example.com';
    const path = url.path?.join('/') || '';

    return `${protocol}://${host}/${path}`;
  }

  private extractHeaders(headers?: Array<{ key: string; value: string; disabled?: boolean }>): Record<string, string> {
    if (!headers) return {};

    return headers
      .filter(h => !h.disabled)
      .reduce((acc, h) => {
        acc[h.key] = h.value;
        return acc;
      }, {} as Record<string, string>);
  }

  private extractQueryParams(url: string | PostmanUrl): Record<string, string> {
    if (typeof url === 'string') {
      // URL'den query params çıkar
      try {
        const urlObj = new URL(url);
        const params: Record<string, string> = {};
        urlObj.searchParams.forEach((value, key) => {
          params[key] = value;
        });
        return params;
      } catch {
        return {};
      }
    }

    if (!url.query) return {};

    return url.query
      .filter(q => !q.disabled)
      .reduce((acc, q) => {
        acc[q.key] = q.value;
        return acc;
      }, {} as Record<string, string>);
  }

  private extractBody(body?: any): RequestBody | undefined {
    if (!body) return undefined;

    switch (body.mode) {
      case 'raw':
        return {
          type: this.detectBodyType(body.raw, body.options?.raw?.language),
          content: this.parseBodyContent(body.raw, body.options?.raw?.language),
          contentType: this.getContentType(body.options?.raw?.language),
        };

      case 'urlencoded':
        return {
          type: 'urlencoded',
          content: body.urlencoded?.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
          }, {}),
          contentType: 'application/x-www-form-urlencoded',
        };

      case 'formdata':
        return {
          type: 'formdata',
          content: body.formdata,
          contentType: 'multipart/form-data',
        };

      default:
        return {
          type: 'raw',
          content: body.raw || '',
        };
    }
  }

  private detectBodyType(raw?: string, language?: string): 'json' | 'raw' {
    if (language === 'json' || this.isJSON(raw)) return 'json';
    return 'raw';
  }

  private parseBodyContent(raw?: string, language?: string): any {
    if (!raw) return null;

    if (language === 'json' || this.isJSON(raw)) {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }

    return raw;
  }

  private isJSON(str?: string): boolean {
    if (!str) return false;
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  private getContentType(language?: string): string {
    const contentTypes: Record<string, string> = {
      json: 'application/json',
      xml: 'application/xml',
      html: 'text/html',
      text: 'text/plain',
    };

    return contentTypes[language || ''] || 'application/json';
  }

  private extractAuth(auth?: any): RequestAuth | undefined {
    if (!auth || auth.type === 'noauth') return undefined;

    switch (auth.type) {
      case 'bearer':
        const bearerToken = auth.bearer?.find((item: any) => item.key === 'token');
        return bearerToken ? {
          type: 'bearer',
          token: bearerToken.value,
        } : undefined;

      case 'basic':
        const username = auth.basic?.find((item: any) => item.key === 'username');
        const password = auth.basic?.find((item: any) => item.key === 'password');
        return {
          type: 'basic',
          username: username?.value,
          password: password?.value,
        };

      case 'apikey':
        const key = auth.apikey?.find((item: any) => item.key === 'key');
        const value = auth.apikey?.find((item: any) => item.key === 'value');
        return {
          type: 'apikey',
          apiKey: key?.value,
          apiValue: value?.value,
        };

      default:
        return undefined;
    }
  }
}

// Export singleton instance
export const postmanParser = new PostmanParser();
