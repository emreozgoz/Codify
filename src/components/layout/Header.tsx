// src/components/layout/Header.tsx

'use client';

import { Code2 } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Code2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Codify</h1>
            <p className="text-sm text-muted-foreground">
              Postman to Code Generator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
