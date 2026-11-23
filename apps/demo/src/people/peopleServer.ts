import { samplePeople, type Person } from '@/people/samplePeople';
import type { ServerFilter, ServerRowsPage, ServerRowsRequest } from '@istec/grid';

// Stands in for a backend endpoint, which would turn the request into SQL.
const people = samplePeople(100_000, 2);
const latencyMs = 300;

function field(person: Person, columnId: string): unknown {
  return Reflect.get(person, columnId);
}

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).toLowerCase() : '';
}

function matches(person: Person, filter: ServerFilter): boolean {
  const value = field(person, filter.columnId);
  if (filter.kind === 'text') return text(value).includes(filter.value.toLowerCase());
  if (filter.kind === 'set') return filter.value.includes(value ?? null);
  const [min, max] = filter.value;
  const number = value instanceof Date ? value.getTime() : Number(value);
  return (min === undefined || number >= Number(min)) && (max === undefined || number <= Number(max));
}

function compare(a: unknown, b: unknown): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return text(a).localeCompare(text(b));
}

function query({ sorting, filters, search }: ServerRowsRequest): Person[] {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const found = people.filter(
    (person) =>
      filters.every((filter) => matches(person, filter)) &&
      words.every((word) => Object.values(person).some((value) => text(value).includes(word)))
  );
  return found.toSorted((a, b) => {
    for (const { id, desc } of sorting) {
      const order = compare(field(a, id), field(b, id));
      if (order !== 0) return desc ? -order : order;
    }
    return 0;
  });
}

export async function fetchPeople(request: ServerRowsRequest): Promise<ServerRowsPage<Person>> {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, latencyMs);
    request.signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(request.signal.reason);
    });
  });
  const rows = query(request);
  return { rows: rows.slice(request.offset, request.offset + request.limit), rowCount: rows.length };
}

export async function savePerson(updated: Person): Promise<void> {
  const index = people.findIndex((person) => person.id === updated.id);
  if (index !== -1) people[index] = updated;
}
