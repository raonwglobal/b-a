#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
const root = process.cwd();
const outDir = join(root, 'out');
const I18N = join(root, 'scripts', 'i18n.js');
function ensureDir(p){mkdirSync(p,{recursive:true});}
function writeOut(rel,content){const p=join(outDir,rel);ensureDir(dirname(p));writeFileSync(p,content,'utf8');console.log('[cf-safe-build] wrote',rel,`(${Buffer.byteLength(content)}b)`);}
function scrub(t){return t.replaceAll('info@bambooasia.biz (예시)','info@bambooasia.biz').replaceAll('hello@b-a.kr','info@bambooasia.biz').replaceAll('contact@b-a.asia','info@bambooasia.biz');}
function load(){
  const dir=join(root,'scripts');
  const parts=readdirSync(dir).filter(f=>/^full-page\.chunk\d+\.txt$/.test(f)).sort((a,b)=>Number(a.match(/chunk(\d+)/)[1])-Number(b.match(/chunk(\d+)/)[1]));
  if(parts.length){const html=parts.map(f=>readFileSync(join(dir,f),'utf8')).join('');console.log('[cf-safe-build] chunks',parts.length);return html;}
  const full=join(dir,'full-page.html');
  if(existsSync(full)) return readFileSync(full,'utf8');
  return null;
}
async function main(){
  if(existsSync(outDir)) rmSync(outDir,{recursive:true,force:true});
  ensureDir(outDir);
  const html=load();
  if(!html){console.error('FATAL');process.exit(1);}
  writeOut('index.html',scrub(html));
  if(existsSync(I18N)) writeOut('i18n.js',readFileSync(I18N,'utf8'));
  writeOut('404.html','<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem"><h1>404</h1><p><a href="/">b/a home</a></p></body></html>');
  console.log('[cf-safe-build] done');
}
main().catch(e=>{console.error(e);process.exit(1);});
