import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const limit = 25 * 1024 * 1024;
const forbidden = /^(?:\..*|node_modules|dist|README(?:\..*)?|AGENTS\.md|package(?:-lock)?\.json|wrangler\..*)$/i;

// Only this fixed output path may be deleted. Never follow an output symlink/junction.
function clean() {
  if (dirname(dist) !== root || dist !== resolve(root, 'dist')) throw new Error('Unsafe output path');
  if (existsSync(dist) && lstatSync(dist).isSymbolicLink()) throw new Error('dist must not be a symlink or junction');
  rmSync(dist, { recursive: true, force: true });
}

try {
  clean();
  const config = JSON.parse(readFileSync(join(root, 'wrangler.json'), 'utf8'));
  if (config.assets?.directory !== './dist') throw new Error('Wrangler assets.directory must be ./dist');
  const files = JSON.parse(readFileSync(join(root, 'scripts/public-files.json'), 'utf8'));
  if (existsSync(join(root, 'rengi-antalya.html'))) files.push('rengi-antalya.html');
  for (const required of ['index.html', 'rengi-istanbul.html']) {
    if (!files.includes(required)) throw new Error(`Missing required page in public manifest: ${required}`);
  }
  const missing = [];
  let largest = { file: '', size: 0 };
  for (const file of files) {
    const parts = file.split('/');
    const allowed = /^(?:index\.html|rengi-istanbul\.html|rengi-antalya\.html)$/.test(file)
      || (/^locales\/(?:en|ru|es|ar|tr|nl)\.json$/.test(file))
      || (/^(?:css|js|img|assets)\//.test(file) && /^(?:\.css|\.js|\.png|\.jpg|\.jpeg|\.svg|\.webp|\.avif|\.gif|\.ico|\.woff2?)$/i.test(extname(file)));
    if (!allowed || file.includes('\\') || parts.some(part => !part || forbidden.test(part))) {
      throw new Error(`Non-public or unsafe manifest entry: ${file}`);
    }
    const source = resolve(root, ...parts);
    if (!source.startsWith(root + sep)) throw new Error(`Source escapes repository: ${file}`);
    let current = root;
    for (const part of parts) {
      current = join(current, part);
      if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error(`Symlink/junction forbidden: ${file}`);
    }
    if (!existsSync(source)) { missing.push(file); continue; }
    const stat = lstatSync(source);
    if (!stat.isFile()) throw new Error(`Required source is not a regular file: ${file}`);
    if (stat.size > limit) throw new Error(`Asset exceeds Cloudflare's 25 MiB limit: ${file} (${stat.size} bytes)`);
    if (stat.size > largest.size) largest = { file, size: stat.size };
  }
  if (missing.length) throw new Error(`Required public source files are missing:\n${missing.map(file => `  ${file}`).join('\n')}`);
  mkdirSync(dist);
  for (const file of files) {
    const destination = join(dist, file);
    mkdirSync(dirname(destination), { recursive: true });
    try { copyFileSync(join(root, file), destination); }
    catch (error) { throw new Error(`Cannot copy required public file ${file}: ${error.message}`); }
  }
  console.log(`Built ${files.length} public files in dist/ (unchanged bytes and relative paths).`);
  console.log(`Largest asset: ${largest.file} (${(largest.size / 1024 / 1024).toFixed(2)} MiB; limit 25 MiB).`);
} catch (error) {
  try { clean(); } catch { /* Preserve the original error; never traverse unsafe output. */ }
  console.error(`Static build failed: ${error.message}`);
  process.exitCode = 1;
}
