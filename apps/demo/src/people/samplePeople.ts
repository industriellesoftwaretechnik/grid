export const statuses = ['active', 'inactive', 'pending'] as const;
export const departments = ['engineering', 'marketing', 'finance', 'sales', 'hr'] as const;

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  status: (typeof statuses)[number];
  department: (typeof departments)[number];
  salary: number;
  joinDate: Date;
};

const firstNames = ['Anna', 'Ben', 'Clara', 'David', 'Emma', 'Felix', 'Greta', 'Hannes', 'Ida', 'Jonas', 'Lea', 'Max'];
const lastNames = ['Bauer', 'Fischer', 'Hoffmann', 'Koch', 'Meyer', 'Müller', 'Richter', 'Schmidt', 'Wagner', 'Weber'];

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

export function samplePeople(count: number, seed: number): Person[] {
  const random = seededRandom(seed);
  const pick = <T>(items: readonly T[]): T => {
    const item = items[Math.floor(random() * items.length)];
    if (item === undefined) throw new Error('pick from an empty list');
    return item;
  };
  const today = Date.now();

  return Array.from({ length: count }, (_, index) => {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    return {
      id: String(index + 1),
      firstName,
      lastName,
      age: 20 + Math.floor(random() * 46),
      email: `${firstName}.${lastName}${index}@example.com`.toLowerCase(),
      status: pick(statuses),
      department: pick(departments),
      salary: 2_500 + Math.round(random() * 90) * 50,
      joinDate: new Date(today - Math.floor(random() * 5 * 365) * 86_400_000),
    };
  });
}
