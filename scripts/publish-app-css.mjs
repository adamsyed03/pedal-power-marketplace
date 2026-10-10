import { copyFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const assetsDirectory = path.join(projectRoot, 'dist', 'assets');
const candidates = (await readdir(assetsDirectory))
  .filter((name) => name.endsWith('.css'))
  .map(async (name) => {
    const source = path.join(assetsDirectory, name);
    return { source, size: (await stat(source)).size };
  });
const stylesheets = await Promise.all(candidates);
const compiledStylesheet = stylesheets.sort((left, right) => right.size - left.size)[0];

if (!compiledStylesheet) throw new Error('The Vite build did not produce a compiled stylesheet.');

await Promise.all([
  copyFile(compiledStylesheet.source, path.join(projectRoot, 'public', 'app.css')),
  copyFile(compiledStylesheet.source, path.join(projectRoot, 'dist', 'app.css')),
]);

console.log(`Published stable app.css fallback (${compiledStylesheet.size.toLocaleString('en-US')} bytes).`);
