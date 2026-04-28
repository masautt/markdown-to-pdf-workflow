import archiver from 'archiver';
import { createWriteStream } from 'fs';

export function createZip(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    // Place dist-pdfs contents at zip root, preserving internal folder structure
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
