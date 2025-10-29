// src/lib/types/postman.types.ts

export interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
}

export interface PostmanItem {
  name: string;
  request: PostmanRequest;
  response?: any[];
}

export interface PostmanRequest {
  method: HttpMethod;
  header?: PostmanHeader[];
  url: string | PostmanUrl;
  body?: PostmanBody;
  auth?: PostmanAuth;
  description?: string;
}

export interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: PostmanQueryParam[];
}

export interface PostmanHeader {
  key: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanQueryParam {
  key: string;
  value: string;
  disabled?: boolean;
}

export interface PostmanBody {
  mode: 'raw' | 'urlencoded' | 'formdata' | 'file' | 'graphql';
  raw?: string;
  urlencoded?: Array<{ key: string; value: string }>;
  formdata?: Array<{ key: string; value: string; type?: string }>;
  options?: {
    raw?: {
      language?: string;
    };
  };
}

export interface PostmanAuth {
  type: 'bearer' | 'basic' | 'apikey' | 'oauth2' | 'noauth';
  bearer?: Array<{ key: string; value: string }>;
  basic?: Array<{ key: string; value: string }>;
  apikey?: Array<{ key: string; value: string }>;
}

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
