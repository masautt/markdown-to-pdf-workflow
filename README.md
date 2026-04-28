# markdown-to-pdf-workflow

This project provides an automated workflow for converting a structured set of Markdown documentation into PDFs, organized by domain (automation, dashboards, entities, onboarding, requests, sandbox), and outputs them to a parallel directory structure. The PDFs are then zipped for easy distribution.

## Repository Structure

- **docs/**  
	Source Markdown files, organized by topic (automation, dashboards, entities, onboarding, requests, sandbox).  
	Example: `docs/automation/create-api-key/README.md`

- **dist-pdfs/**  
	Output PDFs, mirroring the structure of `docs/`.  
	Example: `dist-pdfs/automation/create-api-key/README.pdf`

- **scripts/mdpdf/**  
	Node.js scripts for discovering Markdown files, rendering them to HTML/PDF, resolving local assets, and zipping the results.
	- `build-pdfs.mjs` — Main build script
	- `discover.mjs` — Recursively finds all Markdown files in `docs/`
	- `render-markdown.mjs` — Converts Markdown to HTML
	- `resolve-assets.mjs` — Embeds local images as data URIs
	- `render-pdf.mjs` — Uses Playwright to render HTML to PDF
	- `create-zip.mjs` — Zips the output PDFs

- **package.json**  
	Declares dependencies and the build script.

## How It Works

1. **Discover Markdown Files:**  
	 All `.md` files under `docs/` are found recursively.

2. **Convert to HTML:**  
	 Each Markdown file is rendered to HTML using `markdown-it`.

3. **Embed Local Images:**  
	 Local image references are embedded as data URIs for portability.

4. **Render to PDF:**  
	 HTML is rendered to PDF using a headless Chromium browser (via Playwright), with print-friendly CSS.

5. **Output Structure:**  
	 PDFs are written to `dist-pdfs/`, preserving the folder structure from `docs/`.

6. **Create Zip Archive:**  
	 All generated PDFs are zipped into `markdown-pdfs.zip` for easy download or sharing.

## Usage

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Install Dependencies

```sh
npm install
```

### Build PDFs

```sh
npm run build
```

- This will:
	- Discover all Markdown files in `docs/`
	- Generate PDFs in `dist-pdfs/`
	- Create `markdown-pdfs.zip` with all PDFs

### Adding Documentation

- Add or update Markdown files in the appropriate subfolder under `docs/`.
- Images referenced in Markdown should be local and will be embedded automatically.

### Output

- PDFs are generated in `dist-pdfs/`, mirroring the structure of `docs/`.
- The zip file `markdown-pdfs.zip` contains all generated PDFs.

## Customization

- **Print Styles:**  
	Print CSS can be customized in `scripts/mdpdf/render-pdf.mjs`.
- **Folder Structure:**  
	To add new domains or sections, create corresponding folders in `docs/`.

## Troubleshooting

- If a Markdown file references a missing image, the build will fail and report the missing file.
- All errors and a summary are printed to the console after the build.

## License

MIT

---

## Original Prompt

The file `PROMPT.md` contains the original requirements and design prompt that was used to generate this repository and its workflow. Refer to it for the full specification and rationale behind the implementation.

## GitHub Action Usage

You can use this Action in any repository with a `docs/` folder containing markdown files. Example workflow:

```yaml
name: Convert Markdown to PDFs

on:
  push:
    paths:
      - 'docs/**'
  workflow_dispatch:

jobs:
  markdown-to-pdf:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Convert Markdown to PDFs
        uses: your-username/markdown-to-pdf-workflow@v1
```

- Replace `your-username` with your GitHub username or org.
- The generated PDFs and zip will be available as workflow artifacts.