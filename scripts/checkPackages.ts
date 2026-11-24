// Packs with pnpm, as a release does, so the checked tarballs match the published ones.
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const packDir = path.join(root, '.pack');

// Through a shell, so the pnpm/publint/attw `.cmd` shims resolve on Windows too.
function run(command: string, args: string[]): void {
  const line = [command, ...args.map((arg) => JSON.stringify(arg))].join(' ');
  console.log(`$ ${line}`);
  execSync(line, { cwd: root, stdio: 'inherit' });
}

rmSync(packDir, { recursive: true, force: true });
mkdirSync(packDir);
run('pnpm', ['--recursive', '--filter', './packages/*', 'pack', '--pack-destination', packDir]);

const tarballs = readdirSync(packDir).filter((file) => file.endsWith('.tgz'));
if (tarballs.length === 0) throw new Error('pnpm pack produced no tarballs');

for (const tarball of tarballs) {
  const file = path.join('.pack', tarball);
  run('publint', ['run', file, '--strict']);
  run('attw', [file, '--profile', 'esm-only']);
}
