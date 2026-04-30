import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const EXCLUDED = new Set(['node_modules', '.git', 'dist-pdfs']);

export async function discoverMarkdownFiles(docsRoot) {
  try {
    await stat(docsRoot);
  } catch {
    throw new Error(`./${docsRoot} directory does not exist`);
  }

  const files = [];
  await walk(docsRoot, files);

  if (files.length === 0) {
    throw new Error(`No markdown files found under ./${docsRoot}`);
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
