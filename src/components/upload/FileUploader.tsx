// src/components/upload/FileUploader.tsx

'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileJson } from 'lucide-react';
import { useCollectionStore } from '@/store/useCollectionStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function FileUploader() {
  const { loadCollection } = useCollectionStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        loadCollection(json);
      } catch (error) {
        console.error('Invalid JSON file:', error);
        alert('Invalid Postman collection file');
      }
    };
    reader.readAsText(file);
  }, [loadCollection]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    multiple: false,
  });

  return (
    <Card className="p-8">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {isDragActive ? (
              <FileJson className="w-8 h-8 text-primary" />
            ) : (
              <Upload className="w-8 h-8 text-primary" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload Postman Collection'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag & drop your .json file or click to browse
            </p>
          </div>

          <Button>
            Select File
          </Button>
        </div>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p className="font-medium mb-2">Supported formats:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Postman Collection v2.1</li>
          <li>Postman Collection v2.0</li>
        </ul>
      </div>
    </Card>
  );
}
