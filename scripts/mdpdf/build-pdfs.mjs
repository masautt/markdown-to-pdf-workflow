#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { relative, join } from 'path';
import { discoverMarkdownFiles } from './discover.mjs';
import { renderMarkdownToHtml } from './render-markdown.mjs';
import { embedLocalImages } from './resolve-assets.mjs';
import { initBrowser, closeBrowser, renderPdf } from './render-pdf.mjs';
import { createZip } from './create-zip.mjs';

const DOCS_ROOT = process.env.DOCS_ROOT ?? 'docs';
const OUT_ROOT = process.env.OUT_ROOT ?? 'dist-pdfs';
const ZIP_PATH = 'markdown-pdfs.zip';

async function main() {
  console.log('markdown-to-pdf: starting build\n');

  let mdFiles;
  try {
    mdFiles = await discoverMarkdownFiles();
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
  }

  console.log(`Found ${mdFiles.length} markdown file(s) under ./${DOCS_ROOT}\n`);

  await initBrowser();

  const results = { success: [], failure: [] };

  for (const mdPath of mdFiles) {
    const relPath = relative(DOCS_ROOT, mdPath);
    const pdfRelPath = relPath.replace(/\.md$/, '.pdf');
    const outputPath = join(OUT_ROOT, pdfRelPath);

    try {
      const content = await readFile(mdPath, 'utf-8');
      const bodyHtml = renderMarkdownToHtml(content);
      const resolvedHtml = await embedLocalImages(bodyHtml, mdPath);
      await renderPdf(resolvedHtml, outputPath);
      console.log(`  OK  ${mdPath} -> ${outputPath}`);
      results.success.push(mdPath);
    } catch (err) {
      console.error(`  FAIL  ${mdPath}`);
      console.error(`        ${err.message}`);
      results.failure.push({ path: mdPath, error: err.message });
    }
  }

  await closeBrowser();

  console.log('\n--- Summary ---');
  console.log(`Total markdown files:  ${mdFiles.length}`);
  console.log(`PDFs generated:        ${results.success.length}`);
  console.log(`Failures:              ${results.failure.length}`);

  if (results.failure.length > 0) {
    console.error('\nFailed files:');
    for (const { path, error } of results.failure) {
      console.error(`  ${path}: ${error}`);
    }
    process.exit(1);
  }

  console.log(`\nCreating ${ZIP_PATH}...`);
  await createZip(OUT_ROOT, ZIP_PATH);
  console.log(`Output zip: ${ZIP_PATH}`);
}

main().catch((err) => {
  console.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
