// src/components/collection/RequestList.tsx

'use client';

import { useCollectionStore } from '@/store/useCollectionStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function RequestList() {
  const { collection, requests, selectedRequestId, selectRequest, clearCollection } = useCollectionStore();

  if (!collection) return null;

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-green-500',
      POST: 'bg-blue-500',
      PUT: 'bg-orange-500',
      DELETE: 'bg-red-500',
      PATCH: 'bg-yellow-500',
    };
    return colors[method] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{collection.info.name}</h2>
          <p className="text-sm text-muted-foreground">
            {requests.length} request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCollection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {requests.map((request) => (
          <Card
            key={request.id}
            className={`p-3 cursor-pointer transition-colors hover:bg-muted ${
              selectedRequestId === request.id ? 'bg-muted border-primary' : ''
            }`}
            onClick={() => selectRequest(request.id)}
          >
            <div className="flex items-center gap-2">
              <Badge className={`${getMethodColor(request.method)} text-white text-xs`}>
                {request.method}
              </Badge>
              <span className="text-sm font-medium truncate">{request.name}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
