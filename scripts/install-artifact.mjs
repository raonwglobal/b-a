#!/usr/bin/env node
/**
 * Install B-A-Execution-Platform.html as production scripts/full-page.html
 *
 * Usage:
 *   node scripts/install-artifact.mjs ./B-A-Execution-Platform.html
 *   node scripts/install-artifact.mjs /path/to/B-A-Execution-Platform.html
 *
 * Then:
 *   git add scripts/full-page.html
 *   git commit -m "feat: full React execution platform UI"
 *   git push
 *   # Cloudflare redeploy
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dest = join(root, 'scripts', 'full-page.html');

const srcPath = process.argv[2];
if (!srcPath) {
  console.error('Usage: node scripts/install-artifact.mjs <B-A-Execution-Platform.html>');
  process.exit(1);
}
if (!existsSync(srcPath)) {
  console.error('File not found:', srcPath);
  process.exit(1);
}

let html = readFileSync(srcPath, 'utf8');
html = html
  .replaceAll('hello@b-a.kr (예시)', 'info@bambooasia.biz')
  .replaceAll('hello@b-a.kr', 'info@bambooasia.biz')
  .replace('<title>React Artifact</title>', '<title>b/a - 베트남 사업 실행 플랫폼</title>');

const inject = `
<script>
(function(){
  function collectInquiry(){
    var sec = document.getElementById('inquiry');
    if(!sec) return null;
    var data = {}, fields = sec.querySelectorAll('input,select,textarea');
    var keys = ['company','name','email','region','industry','budget','message'];
    fields.forEach(function(el,i){ if(keys[i]) data[keys[i]] = el.value; });
    return data;
  }
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('button');
    if(!btn) return;
    var t = (btn.textContent||'');
    if(t.indexOf('계획에서 실행으로') < 0) return;
    var data = collectInquiry();
    if(!data || !data.email || !data.company) return;
    fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(res){ console.log('[b/a] contact', res); })
      .catch(function(err){ console.warn('[b/a] contact err', err); });
  }, true);
})();
</script>
`;

if (html.includes('</body>')) html = html.replace('</body>', inject + '</body>');
else html += inject;

writeFileSync(dest, html, 'utf8');
console.log('Wrote', dest, '(' + Buffer.byteLength(html) + ' bytes)');
console.log('Next: git add scripts/full-page.html && git commit && git push');
