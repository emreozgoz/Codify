// src/components/shared/EmptyState.tsx

'use client';

import { FileJson } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileJson className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Request Selected</h3>
      <p className="text-muted-foreground max-w-md">
        Upload a Postman collection to get started, or select a request from the sidebar
        to generate code snippets in multiple programming languages.
      </p>
    </div>
  );
}
