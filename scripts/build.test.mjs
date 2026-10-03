import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, truncateSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./build.mjs', import.meta.url));
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'turkluxx-build-'));
  t.after(() => {
    if (dirname(root) !== resolve(tmpdir()) || !root.startsWith(join(tmpdir(), 'turkluxx-build-'))) throw new Error('Unsafe test cleanup');
    rmSync(root, { recursive: true, force: true });
  });
  function put(file, content) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  }
  const files = ['index.html', 'rengi-istanbul.html', 'css/site.css', 'js/site.js', 'img/villa/floor.jpg'];
  for (const file of files) put(file, `original ${file}`);
  put('scripts/public-files.json', JSON.stringify(files));
  put('wrangler.json', JSON.stringify({ assets: { directory: './dist' } }));
  copyFileSync(script, join(root, 'scripts/build.mjs'));
  return { root, files, put, run: () => spawnSync(process.execPath, [join(root, 'scripts/build.mjs')], { encoding: 'utf8' }) };
}

test('copies only allowlisted files byte-for-byte, includes optional Antalya, cleans stale output', t => {
  const f = fixture(t);
  f.put('rengi-antalya.html', 'Antalya');
  for (const file of ['.git/objects/pack/secret.pack', 'node_modules/private.js', 'assets/README.md', 'assets/unlisted.png', 'dist/.git/old', 'dist/stale.html']) f.put(file, 'private');
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  for (const file of [...f.files, 'rengi-antalya.html']) assert.deepEqual(readFileSync(join(f.root, 'dist', file)), readFileSync(join(f.root, file)));
  assert.deepEqual(readdirSync(join(f.root, 'dist')).sort(), ['css', 'img', 'index.html', 'js', 'rengi-antalya.html', 'rengi-istanbul.html']);
  assert.equal(f.run().status, 0);
});

test('missing required file stops the build and removes stale output', t => {
  const f = fixture(t);
  f.put('scripts/public-files.json', JSON.stringify([...f.files, 'assets/missing.png']));
  f.put('dist/old.html', 'stale');
  const result = f.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Required public source files are missing:[\s\S]*assets\/missing.png/);
  assert.equal(existsSync(join(f.root, 'dist')), false);
});

test('oversized asset stops the build', t => {
  const f = fixture(t);
  truncateSync(join(f.root, 'img/villa/floor.jpg'), 25 * 1024 * 1024 + 1);
  const result = f.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /exceeds Cloudflare's 25 MiB/);
  assert.equal(existsSync(join(f.root, 'dist')), false);
});

test('rejects metadata, traversal and dependency directories even if added to manifest', t => {
  const f = fixture(t);
  for (const file of ['.git/config', 'img/.git/photo.jpg', 'js/node_modules/private.js', 'css/../secret.css', 'assets/README.md', 'wrangler.json']) {
    f.put('scripts/public-files.json', JSON.stringify([...f.files, file]));
    const result = f.run();
    assert.equal(result.status, 1, file);
    assert.match(result.stderr, /Non-public or unsafe manifest entry/);
  }
});

test('refuses a Wrangler assets directory other than dist', t => {
  const f = fixture(t);
  f.put('wrangler.json', JSON.stringify({ assets: { directory: '.' } }));
  const result = f.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /assets.directory must be .\/dist/);
});
test('Copies the six allowed locale catalogs and rejects other JSON paths', t => {
  const f = fixture(t);
  const locales = ['en', 'ru', 'es', 'ar', 'tr', 'nl'].map(code => `locales/${code}.json`);
  for (const file of locales) f.put(file, '{"common.name":"Name"}');
  f.put('scripts/public-files.json', JSON.stringify([...f.files, ...locales]));
  assert.equal(f.run().status, 0);
  for (const file of locales) assert.deepEqual(readFileSync(join(f.root, 'dist', file)), readFileSync(join(f.root, file)));
  for (const file of ['locales/secrets.json', 'locales/.git/config.json', 'locales/../private.json']) {
    f.put('scripts/public-files.json', JSON.stringify([...f.files, file]));
    assert.equal(f.run().status, 1, file);
  }
});
