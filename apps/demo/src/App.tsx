import { useState } from 'react';

import { PeopleGrid } from '@/people/PeopleGrid';

export function App() {
  const [locale, setLocale] = useState('en-US');

  return (
    <main className="flex h-screen flex-col gap-4 p-6">
      <header className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">ISTEC Grid</h1>
        <label className="ml-auto flex items-center gap-2 text-sm">
          Number and date format
          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
            className="rounded-md border bg-background px-2 py-1"
          >
            <option value="en-US">English (US)</option>
            <option value="de-DE">German</option>
          </select>
        </label>
      </header>
      <PeopleGrid locale={locale} />
    </main>
  );
}
