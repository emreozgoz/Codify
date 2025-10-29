// src/app/page.tsx

'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FileUploader } from '@/components/upload/FileUploader';
import { RequestList } from '@/components/collection/RequestList';
import { CodePreview } from '@/components/code/CodePreview';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCollectionStore } from '@/store/useCollectionStore';

export default function Home() {
  const { requests, selectedRequest } = useCollectionStore();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript-fetch');

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar>
          {requests.length === 0 ? (
            <FileUploader />
          ) : (
            <RequestList />
          )}
        </Sidebar>

        <main className="flex-1 overflow-auto p-6">
          {selectedRequest ? (
            <CodePreview
              request={selectedRequest}
              language={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}
