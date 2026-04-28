import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

const PRINT_CSS = `
  @page {
    margin: 20mm;
    size: A4;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
    margin: 0;
    padding: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.4em;
    margin-bottom: 0.4em;
    line-height: 1.3;
    font-weight: 600;
    page-break-after: avoid;
  }

  h1 { font-size: 2em; border-bottom: 2px solid #e1e4e8; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #e1e4e8; padding-bottom: 0.2em; }
  h3 { font-size: 1.25em; }
  h4, h5, h6 { font-size: 1em; }

  p { margin: 0.8em 0; }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    page-break-inside: avoid;
  }

  pre, code {
    font-family: 'SFMono-Regular', 'Cascadia Code', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 9pt;
  }

  pre {
    background: #f6f8fa;
    border: 1px solid #e1e4e8;
    border-radius: 4px;
    padding: 12px 16px;
    overflow-x: auto;
    page-break-inside: avoid;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  code {
    background: #f6f8fa;
    border: 1px solid #e1e4e8;
    border-radius: 3px;
    padding: 0.1em 0.4em;
  }

  pre code {
    background: none;
    border: none;
    padding: 0;
  }

  blockquote {
    margin: 1em 0;
    padding: 0.5em 1em;
    border-left: 4px solid #0366d6;
    background: #f1f8ff;
    color: #444;
  }

  blockquote p { margin: 0.3em 0; }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    page-break-inside: avoid;
    font-size: 10pt;
  }

  table th {
    background: #f6f8fa;
    font-weight: 600;
    text-align: left;
  }

  table th, table td {
    border: 1px solid #e1e4e8;
    padding: 8px 12px;
  }

  table tr:nth-child(even) { background: #fafafa; }

  hr {
    border: none;
    border-top: 1px solid #e1e4e8;
    margin: 1.5em 0;
  }

  ul, ol {
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  li { margin: 0.25em 0; }

  a { color: #0366d6; text-decoration: none; }
`;

function wrapInDocument(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${PRINT_CSS}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

let browser = null;

export async function initBrowser() {
  browser = await chromium.launch();
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function renderPdf(bodyHtml, outputPath) {
  if (!browser) throw new Error('Browser not initialized — call initBrowser() first');

  await mkdir(dirname(outputPath), { recursive: true });

  const page = await browser.newPage();
  try {
    const fullHtml = wrapInDocument(bodyHtml);
    await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });
  } finally {
    await page.close();
  }
}
