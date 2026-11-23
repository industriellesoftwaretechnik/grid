import { useState } from 'react';

import { PeopleGrid } from '@/people/PeopleGrid';

export function App() {
  const [german, setGerman] = useState(false);

  return (
    <main className="flex h-screen flex-col gap-4 p-6">
      <header className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">ISTEC Grid</h1>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={german} onChange={(event) => setGerman(event.target.checked)} />
          Deutsch
        </label>
      </header>
      <PeopleGrid german={german} />
    </main>
  );
}
