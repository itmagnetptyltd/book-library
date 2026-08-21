import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { aBook, aRunningLibrary } from '../helpers/library-server.js';
import { PROJECT_ROOT } from '../../src/config.js';
import { DEFAULT_HOST } from '../../src/server.js';

function readPackageJson() {
  return JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
}

// @covers REQ-BOOK-011@v1
test('the application starts and reports the address it is serving on', async (t) => {
  const library = await aRunningLibrary(t, []);

  assert.match(library.url, /^http:\/\/127\.0\.0\.1:\d+\/?$/);
});

// @covers REQ-BOOK-011@v1
test('a browser on the same PC opening that address is returned the Home page', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Nondito Noroke' })]);

  const { status, body, headers } = await library.get('/');

  assert.equal(status, 200);
  assert.match(headers.get('content-type') ?? '', /text\/html/);
  assert.match(body, /<!doctype html>/i);
});

// @covers REQ-BOOK-011@v1
test('no hosting, domain or external service is needed to reach the Home page', async (t) => {
  // The documented start command names nothing outside this repository, and the
  // server binds to the loopback interface, so no domain or host is involved.
  const packageJson = readPackageJson();

  assert.equal(packageJson.scripts.start, 'node src/server.js');
  assert.equal(DEFAULT_HOST, '127.0.0.1');

  const library = await aRunningLibrary(t, []);
  const { status } = await library.get('/');
  assert.equal(status, 200);
});

// @covers REQ-BOOK-011@v1
test('no operating system or browser version beyond a local development environment is required', () => {
  const packageJson = readPackageJson();

  // Declaring an `os` or `cpu` field would be exactly such a requirement.
  assert.equal(packageJson.os, undefined);
  assert.equal(packageJson.cpu, undefined);
  assert.deepEqual(Object.keys(packageJson.engines), ['node']);
});

// Supporting test. The stylesheet is served from one fixed route rather than a
// static file server, per ADR-0002 — path traversal is made impossible rather
// than defended against.
test('an unknown path is refused rather than read from disk', async (t) => {
  const library = await aRunningLibrary(t, []);

  const missing = await library.get('/nothing-here');
  const traversal = await library.get('/../../package.json');

  assert.equal(missing.status, 404);
  assert.equal(traversal.status, 404);
  assert.doesNotMatch(traversal.body, /better-sqlite3/);
});

// Supporting test. The Home page links a stylesheet, so that route must work.
test('the stylesheet is served', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status, headers, body } = await library.get('/home-page.css');

  assert.equal(status, 200);
  assert.match(headers.get('content-type') ?? '', /text\/css/);
  assert.match(body, /\.gallery/);
});
