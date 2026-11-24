// Dependencies are read from the imports so they cannot drift; `--check` fails when `registry/` is stale.
import { execSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const check = process.argv.includes('--check');
const root = path.resolve(import.meta.dirname, '..');
const demo = path.join(root, 'apps/demo');
const folder = 'src/components/data-grid';
const output = path.join(root, 'registry');
const registryPath = path.join(demo, 'registry.json');

// Installed by the host itself: React with the app, `cn` with `shadcn init`.
const provided = new Set(['react', 'react-dom', '@/lib/utils']);

interface RegistryItem {
  name: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: unknown[];
}
interface Registry {
  items: RegistryItem[];
}

function isRegistry(value: unknown): value is Registry {
  return typeof value === 'object' && value !== null && 'items' in value && Array.isArray(value.items);
}

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function packageVersion(dir: string): string {
  const manifest = readJson(path.join(root, dir, 'package.json'));
  if (typeof manifest !== 'object' || manifest === null || !('version' in manifest))
    throw new Error(`${dir}: no version`);
  return String(manifest.version);
}

function packageOf(specifier: string): string {
  const parts = specifier.split('/');
  return (specifier.startsWith('@') ? parts.slice(0, 2) : parts.slice(0, 1)).join('/');
}

const files = readdirSync(path.join(demo, folder))
  .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
  .toSorted();

const dependencies = new Set<string>();
const components = new Set<string>();
for (const file of files) {
  const source = readFileSync(path.join(demo, folder, file), 'utf8');
  for (const [, specifier = ''] of source.matchAll(/^import[^'"]*['"]([^'"]+)['"]/gm)) {
    if (provided.has(specifier) || specifier.startsWith('@/components/data-grid/')) continue;
    if (specifier.startsWith('@/components/ui/')) components.add(specifier.slice('@/components/ui/'.length));
    else if (specifier.startsWith('@/'))
      throw new Error(`${file} imports ${specifier}, which the registry cannot install`);
    else dependencies.add(packageOf(specifier));
  }
}

const parsed = readJson(registryPath);
if (!isRegistry(parsed)) throw new Error('registry.json has no items');
const item = parsed.items.find((candidate) => candidate.name === 'data-grid');
if (!item) throw new Error('registry.json has no data-grid item');

// The installed files call the hooks of the package version they were written against.
const gridVersion = packageVersion('packages/grid');
item.dependencies = [...dependencies]
  .toSorted()
  .map((name) => (name === '@istec/grid' ? `${name}@^${gridVersion}` : name));
item.registryDependencies = [...components].toSorted();
item.files = files.map((file) => ({
  path: `${folder}/${file}`,
  type: 'registry:component',
  target: `components/data-grid/${file}`,
}));
const registryJson = `${JSON.stringify(parsed, null, 2)}\n`;

function build(target: string) {
  execSync(`pnpm exec shadcn build registry.json --output "${target}"`, { cwd: demo, stdio: 'inherit' });
}

if (!check) {
  writeFileSync(registryPath, registryJson);
  build(output);
} else {
  const stale: string[] = [];
  if (readFileSync(registryPath, 'utf8') !== registryJson) stale.push('apps/demo/registry.json');
  const temp = mkdtempSync(path.join(tmpdir(), 'istec-registry-'));
  const tempRegistry = path.join(temp, 'registry.json');
  try {
    writeFileSync(tempRegistry, registryJson);
    execSync(`pnpm exec shadcn build "${tempRegistry}" --output "${path.join(temp, 'out')}"`, {
      cwd: demo,
      stdio: 'inherit',
    });
    const built = readdirSync(path.join(temp, 'out')).toSorted();
    const committed = readdirSync(output).toSorted();
    for (const file of new Set([...built, ...committed])) {
      const read = (dir: string) => (readdirSync(dir).includes(file) ? readFileSync(path.join(dir, file), 'utf8') : '');
      if (read(path.join(temp, 'out')) !== read(output)) stale.push(`registry/${file}`);
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
  if (stale.length > 0) {
    console.error(`The registry is out of date (${stale.join(', ')}). Run \`pnpm registry\` and commit the result.`);
    process.exit(1);
  }
}
