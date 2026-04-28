Build a repo-local markdown-to-pdf workflow for GitHub Actions.

Core requirement:
- All markdown files MUST be discovered under the ./docs directory at the root of the repository.
- Do NOT accept a dynamic source path for phase 1. Hardcode ./docs as the input root.

Functional requirements:
- Use Node.js.
- Recursively scan ./docs for all .md files.
- For each markdown file, generate a single PDF.
- Preserve the folder structure relative to ./docs in the output directory.

Example:
  docs/guides/setup.md -> dist-pdfs/guides/setup.pdf
  docs/admin/reporting/overview.md -> dist-pdfs/admin/reporting/overview.pdf

- Relative image references such as ./imgs/foo.png must be included in the generated PDF.
- Resolve all image paths relative to the markdown file’s location.
- Prefer rewriting local image references to embedded data URIs before browser rendering so the HTML is self-contained.

Rendering requirements:
- Use markdown-it to render markdown to HTML.
- Use Playwright (Chromium) to render HTML to PDF.
- Use printBackground: true.
- Wait for all images and fonts to load before generating the PDF.

Asset handling:
- Support:
  - Markdown image syntax: ![alt](./imgs/foo.png)
  - HTML <img> tags inside markdown
- Fail the build if any referenced local image is missing.

Styling:
- Include a default print stylesheet optimized for documentation PDFs:
  - readable margins
  - proper heading spacing
  - prevent images/code blocks from splitting across pages
  - images max-width: 100%

CLI requirements:
- Provide a CLI entry point:
  node scripts/mdpdf/build-pdfs.mjs

- The CLI should:
  - always read from ./docs
  - always output to ./dist-pdfs
  - not require arguments in phase 1

Project structure:
- Organize code into modules:
  - file discovery (scans ./docs)
  - markdown rendering
  - asset resolution (image embedding)
  - PDF rendering (Playwright)
  - zip creation

Discovery rules:
- Include: **/*.md under ./docs
- Exclude:
  - node_modules
  - .git
  - dist-pdfs
  - hidden folders

Output requirements:
- Output directory: ./dist-pdfs
- Mirror folder structure relative to ./docs
- Generate one PDF per markdown file

Artifact requirements:
- After generating PDFs, create:
  ./markdown-pdfs.zip

- The zip must contain the contents of dist-pdfs, preserving folder structure.

GitHub Actions workflow:
- Create .github/workflows/build-markdown-pdfs.yml
- Runs on ubuntu-latest
- Steps:
  1. Checkout repo
  2. Setup Node (v20)
  3. npm ci
  4. Install Playwright Chromium:
     npx playwright install --with-deps chromium
  5. Run:
     node scripts/mdpdf/build-pdfs.mjs
  6. Zip output:
     zip -r markdown-pdfs.zip dist-pdfs
  7. Upload artifact:
     name: markdown-pdfs
     path: markdown-pdfs.zip

Triggers:
- Run on:
  - push (when files under docs/** change)
  - pull_request (when files under docs/** change)
  - workflow_dispatch

Failure behavior:
- Fail if:
  - ./docs does not exist
  - no markdown files are found
  - any referenced image is missing
  - PDF generation fails for any file

Logging:
- Output a summary:
  - total markdown files found
  - PDFs successfully generated
  - failures (with file paths)
  - output zip location

Implementation approach:
- Keep phase 1 simple and working before adding advanced features.
- Do not implement optional features yet (TOC, frontmatter config, merging PDFs, etc.).