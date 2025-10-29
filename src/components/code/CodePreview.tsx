// src/components/code/CodePreview.tsx

'use client';

import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, Check } from 'lucide-react';
import { NormalizedRequest } from '@/lib/types/request.types';
import { generatorFactory } from '@/lib/generators';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LanguageSelector } from './LanguageSelector';

interface CodePreviewProps {
  request: NormalizedRequest;
  language: string;
  onLanguageChange: (language: string) => void;
}

export function CodePreview({ request, language, onLanguageChange }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const generatedCode = useMemo(() => {
    try {
      const generator = generatorFactory.getGenerator(language);
      return generator.generate(request);
    } catch (error) {
      console.error('Code generation error:', error);
      return '// Error generating code';
    }
  }, [request, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const generator = generatorFactory.getGenerator(language);
    const extension = generator.getFileExtension();
    const filename = `${request.name.replace(/\s+/g, '-').toLowerCase()}.${extension}`;

    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageForHighlighter = (lang: string): string => {
    if (lang.startsWith('javascript')) return 'javascript';
    if (lang === 'nodejs') return 'javascript';
    if (lang === 'python') return 'python';
    if (lang === 'curl') return 'bash';
    if (lang === 'php') return 'php';
    return 'text';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{request.name}</h2>
          <p className="text-sm text-muted-foreground">
            {request.method} • {request.url}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector
            value={language}
            onChange={onLanguageChange}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? (
              <><Check className="w-4 h-4 mr-2" /> Copied</>
            ) : (
              <><Copy className="w-4 h-4 mr-2" /> Copy</>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <SyntaxHighlighter
          language={getLanguageForHighlighter(language)}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          showLineNumbers
        >
          {generatedCode}
        </SyntaxHighlighter>
      </Card>
    </div>
  );
}
