// src/lib/types/request.types.ts

export interface NormalizedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body?: RequestBody;
  auth?: RequestAuth;
  description?: string;
}

export interface RequestBody {
  type: 'json' | 'form' | 'urlencoded' | 'raw' | 'formdata';
  content: any;
  contentType?: string;
}

export interface RequestAuth {
  type: 'bearer' | 'basic' | 'apikey';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiValue?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
