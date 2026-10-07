#!/usr/bin/env node
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gunzipSync } from 'node:zlib';

const dir = dirname(fileURLToPath(import.meta.url));
const implPath = join(dir, '_build-digital-cards.impl.mjs');
const b64Path = join(dir, 'build-digital-cards.impl.b64');

function ensureImpl() {
  if (existsSync(implPath) && readFileSync(implPath).length > 500) return;
  const b64 = readFileSync(b64Path, 'utf8').replace(/\s+/g, '');
  writeFileSync(implPath, gunzipSync(Buffer.from(b64, 'base64')));
}

export async function buildDigitalCards() {
  ensureImpl();
  const mod = await import(pathToFileURL(implPath).href + '?v=1');
  return mod.buildDigitalCards();
}

const isMain = process.argv[1] && process.argv[1].includes('build-digital-cards');
if (isMain) {
  buildDigitalCards()
    .then((r) => { if (!r?.ok) process.exitCode = 1; })
    .catch((e) => { console.error(e); process.exit(1); });
}
