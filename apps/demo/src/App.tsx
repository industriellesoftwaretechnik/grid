import { GridPlaceholder } from '@istec/grid-ui';

const people = [
  { name: 'Ada', role: 'Engineer' },
  { name: 'Grace', role: 'Admiral' },
  { name: 'Linus', role: 'Maintainer' },
];

export function App() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">ISTEC Grid</h1>
      <GridPlaceholder data={people} />
    </main>
  );
}
