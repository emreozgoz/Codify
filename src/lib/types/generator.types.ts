// src/lib/types/generator.types.ts

import { NormalizedRequest } from './request.types';

export type SupportedLanguage =
  | 'javascript-fetch'
  | 'javascript-axios'
  | 'python'
  | 'curl'
  | 'nodejs'
  | 'php'
  | 'java'
  | 'csharp'
  | 'go';

export interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  description: string;
  extension: string;
  icon?: string;
}

export interface GeneratedCode {
  language: SupportedLanguage;
  code: string;
  filename: string;
}

export interface CodeGenerator {
  generate(request: NormalizedRequest): string;
  getFileExtension(): string;
  getName(): string;
}
