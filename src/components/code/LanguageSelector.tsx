// src/components/code/LanguageSelector.tsx

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const languages = [
  { id: 'javascript-fetch', name: 'JavaScript (Fetch)' },
  { id: 'nodejs', name: 'Node.js (Axios)' },
  { id: 'python', name: 'Python (Requests)' },
  { id: 'curl', name: 'cURL' },
  { id: 'php', name: 'PHP (cURL)' },
  { id: 'java', name: 'Java (HttpClient)' },
  { id: 'csharp', name: 'C# (HttpClient)' },
  { id: 'go', name: 'Go (net/http)' },
];

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.id} value={lang.id}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
