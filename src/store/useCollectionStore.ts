// src/store/useCollectionStore.ts

import { create } from 'zustand';
import { NormalizedRequest } from '@/lib/types/request.types';
import { PostmanCollection } from '@/lib/types/postman.types';
import { postmanParser } from '@/lib/parsers/postmanParser';

interface CollectionStore {
  // State
  collection: PostmanCollection | null;
  requests: NormalizedRequest[];
  selectedRequestId: string | null;
  selectedRequest: NormalizedRequest | null;

  // Actions
  loadCollection: (collection: PostmanCollection) => void;
  selectRequest: (requestId: string) => void;
  clearCollection: () => void;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  collection: null,
  requests: [],
  selectedRequestId: null,
  selectedRequest: null,

  loadCollection: (collection) => {
    const requests = postmanParser.parse(collection);
    set({
      collection,
      requests,
      selectedRequestId: requests[0]?.id || null,
      selectedRequest: requests[0] || null,
    });
  },

  selectRequest: (requestId) => {
    const request = get().requests.find(r => r.id === requestId);
    set({
      selectedRequestId: requestId,
      selectedRequest: request || null,
    });
  },

  clearCollection: () => {
    set({
      collection: null,
      requests: [],
      selectedRequestId: null,
      selectedRequest: null,
    });
  },
}));
