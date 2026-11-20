import { useState } from 'react';

import { ClientPeopleGrid, ServerPeopleGrid } from '@/people/PeopleGrid';

const pages = { client: 'Client rows', server: 'Server rows' } as const;

export function App() {
  const [page, setPage] = useState<keyof typeof pages>('client');
  const [german, setGerman] = useState(false);

  return (
    <main className="flex h-screen flex-col gap-4 p-6">
      <header className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">ISTEC Grid</h1>
        <nav className="flex gap-1">
          {Object.entries(pages).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={page === key}
              onClick={() => setPage(key === 'server' ? 'server' : 'client')}
              className="rounded-md px-3 py-1 text-sm hover:bg-muted aria-pressed:bg-muted aria-pressed:font-medium"
            >
              {label}
            </button>
          ))}
        </nav>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={german} onChange={(event) => setGerman(event.target.checked)} />
          Deutsch
        </label>
      </header>
      {page === 'client' ? <ClientPeopleGrid german={german} /> : <ServerPeopleGrid german={german} />}
    </main>
  );
}
