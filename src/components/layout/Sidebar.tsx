// src/components/layout/Sidebar.tsx

'use client';

import { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-96 border-r bg-muted/30 overflow-auto">
      <div className="p-4">
        {children}
      </div>
    </aside>
  );
}
