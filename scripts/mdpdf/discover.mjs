import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const DOCS_ROOT = 'docs';
const EXCLUDED = new Set(['node_modules', '.git', 'dist-pdfs']);

export async function discoverMarkdownFiles() {
  try {
    await stat(DOCS_ROOT);
  } catch {
    throw new Error('./docs directory does not exist');
  }

  const files = [];
  await walk(DOCS_ROOT, files);

  if (files.length === 0) {
    throw new Error('No markdown files found under ./docs');
  }

  return files;
}

async function walk(dir, files) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || EXCLUDED.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
}
