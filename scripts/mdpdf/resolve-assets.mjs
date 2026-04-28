import { readFile, access } from 'fs/promises';
import { resolve, dirname, extname } from 'path';

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

export async function embedLocalImages(bodyHtml, markdownFilePath) {
  const dir = dirname(resolve(markdownFilePath));
  const imgRegex = /(<img[^>]*?\ssrc=")([^"]*?)(")/gi;

  let result = '';
  let lastIndex = 0;
  const matches = [...bodyHtml.matchAll(imgRegex)];

  for (const match of matches) {
    const [fullMatch, prefix, src, suffix] = match;

    result += bodyHtml.slice(lastIndex, match.index);

    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      result += fullMatch;
    } else {
      const imagePath = resolve(dir, src);

      try {
        await access(imagePath);
      } catch {
        throw new Error(`Missing image: ${imagePath}\n  Referenced in: ${markdownFilePath}`);
      }

      const imageBuffer = await readFile(imagePath);
      const mimeType = MIME_TYPES[extname(imagePath).toLowerCase()] ?? 'image/png';
      const dataUri = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      result += `${prefix}${dataUri}${suffix}`;
    }

    lastIndex = match.index + fullMatch.length;
  }

  result += bodyHtml.slice(lastIndex);
  return result;
}
