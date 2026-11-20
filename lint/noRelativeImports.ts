import { existsSync } from 'node:fs';
import path from 'node:path';
import { definePlugin, defineRule, type ESTree } from 'vite-plus/lint/plugins';

const candidates = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

function packageSrc(dir: string): string | undefined {
  for (let d = dir; d !== path.dirname(d); d = path.dirname(d)) {
    if (existsSync(path.join(d, 'package.json'))) return path.join(d, 'src');
  }
  return undefined;
}

function absoluteSpecifier(file: string, relative: string, alias: string, extension: boolean): string | undefined {
  const dir = path.dirname(file);
  const target = candidates
    .map((suffix) => path.resolve(dir, relative + suffix))
    .find((candidate) => /\.tsx?$/.test(candidate) && existsSync(candidate));
  const src = packageSrc(dir);
  if (!target || !src || !target.startsWith(src + path.sep)) return undefined;
  const specifier = path.relative(src, target).split(path.sep).join('/');
  return alias + (extension ? specifier : specifier.replace(/(\/index)?\.tsx?$/, ''));
}

function isStringLiteral(node: ESTree.Node | null): node is ESTree.StringLiteral {
  return node?.type === 'Literal' && typeof node.value === 'string';
}

const noRelativeImports = defineRule({
  meta: {
    type: 'suggestion',
    fixable: 'code',
    messages: { relative: 'Import through {{alias}} instead of a relative path.' },
    schema: [
      {
        type: 'object',
        properties: { alias: { type: 'string' }, extension: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const [options] = context.options;
    const given = typeof options === 'object' && options !== null && !Array.isArray(options) ? options : {};
    const alias = typeof given.alias === 'string' ? given.alias : '#/';
    const extension = typeof given.extension === 'boolean' ? given.extension : true;

    const check = (source: ESTree.Node | null) => {
      if (!isStringLiteral(source) || !source.value.startsWith('.')) return;
      const replacement = absoluteSpecifier(context.filename, source.value, alias, extension);
      const quote = source.raw?.[0] ?? "'";
      context.report({
        node: source,
        messageId: 'relative',
        data: { alias },
        fix: replacement ? (fixer) => fixer.replaceText(source, quote + replacement + quote) : undefined,
      });
    };
    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
    };
  },
});

export default definePlugin({
  meta: { name: 'workspace' },
  rules: { 'no-relative-imports': noRelativeImports },
});
