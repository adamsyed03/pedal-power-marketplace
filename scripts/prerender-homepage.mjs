import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const projectRoot = process.cwd();
const indexPath = path.join(projectRoot, 'index.html');
const startMarker = '<!-- POGON_HOME_SSR_START -->';
const endMarker = '<!-- POGON_HOME_SSR_END -->';

const vite = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const { default: App } = await vite.ssrLoadModule('/src/app/App.tsx');
  const homepageMarkup = renderToString(React.createElement(App));

  const requiredContent = [
    'id="modeli"',
    'Pogon Cargo',
    'Pogon Core',
    'Pogon Glide',
    'id="zasto-pogon"',
    'id="test-voznja"',
    'id="kviz"',
    'id="iskustva"',
    '>FAQ<',
    'Garancije',
    'Servis',
  ];
  const missingContent = requiredContent.filter((snippet) => !homepageMarkup.includes(snippet));
  if (missingContent.length) {
    throw new Error(`Homepage prerender is missing required content: ${missingContent.join(', ')}`);
  }

  const indexHtml = await readFile(indexPath, 'utf8');
  const startIndex = indexHtml.indexOf(startMarker);
  const endIndex = indexHtml.indexOf(endMarker);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error('Homepage prerender markers are missing or out of order in index.html.');
  }

  const prerenderedRoot = `${startMarker}\n      <div id="root" data-prerendered-home="true">${homepageMarkup}</div>\n      ${endMarker}`;
  const nextHtml = `${indexHtml.slice(0, startIndex)}${prerenderedRoot}${indexHtml.slice(endIndex + endMarker.length)}`;
  if (nextHtml !== indexHtml) await writeFile(indexPath, nextHtml, 'utf8');

  console.log(`Prerendered homepage into index.html (${homepageMarkup.length.toLocaleString('en-US')} characters).`);
} finally {
  await vite.close();
}
