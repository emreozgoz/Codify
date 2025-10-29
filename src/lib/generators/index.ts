// src/lib/generators/index.ts

import { CodeGenerator } from '@/lib/types/generator.types';
import { JavaScriptFetchGenerator } from './javascript';
import { PythonGenerator } from './python';
import { CurlGenerator } from './curl';
import { NodeJsAxiosGenerator } from './nodejs';
import { PhpCurlGenerator } from './php';
import { JavaHttpClientGenerator } from './java';
import { CSharpHttpClientGenerator } from './csharp';
import { GoHttpGenerator } from './go';

export class GeneratorFactory {
  private generators: Map<string, CodeGenerator>;

  constructor() {
    this.generators = new Map<string, CodeGenerator>([
      ['javascript-fetch', new JavaScriptFetchGenerator()],
      ['python', new PythonGenerator()],
      ['curl', new CurlGenerator()],
      ['nodejs', new NodeJsAxiosGenerator()],
      ['php', new PhpCurlGenerator()],
      ['java', new JavaHttpClientGenerator()],
      ['csharp', new CSharpHttpClientGenerator()],
      ['go', new GoHttpGenerator()],
    ]);
  }

  getGenerator(language: string): CodeGenerator {
    const generator = this.generators.get(language);
    if (!generator) {
      throw new Error(`Generator not found for language: ${language}`);
    }
    return generator;
  }

  getAllLanguages() {
    return Array.from(this.generators.keys());
  }
}

export const generatorFactory = new GeneratorFactory();
