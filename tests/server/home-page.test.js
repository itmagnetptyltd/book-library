import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { aBook, aRunningLibrary, countBookCards } from '../helpers/library-server.js';
import { PROJECT_ROOT } from '../../src/config.js';

// @covers REQ-BOOK-001@v1
test('every Book in the Library gets a card in the Gallery', async (t) => {
  const library = await aRunningLibrary(t, [
    aBook({ name: 'Nondito Noroke' }),
    aBook({ name: 'Deyal' }),
    aBook({ name: 'Matir Moina' }),
  ]);

  const { body } = await library.get('/');

  assert.equal(countBookCards(body), 3);
});

// @covers REQ-BOOK-001@v1
test('a Book in the Library is present in the Gallery by name', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Nondito Noroke' })]);

  const { body } = await library.get('/');

  assert.match(body, /Nondito Noroke/);
});

// @covers REQ-BOOK-001@v1
test('the most recently added Book appears first in the Gallery', async (t) => {
  const library = await aRunningLibrary(t, [
    aBook({ name: 'AddedFirst' }),
    aBook({ name: 'AddedSecond' }),
  ]);

  const { body } = await library.get('/');

  assert.ok(
    body.indexOf('AddedSecond') < body.indexOf('AddedFirst'),
    'the more recently added Book should appear before the earlier one',
  );
});

// @covers REQ-BOOK-001@v1
test('an empty Library shows an invitation to add the first Book, and no cards', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { body } = await library.get('/');

  assert.equal(countBookCards(body), 0);
  assert.match(body, /no Books yet/i);
  assert.match(body, /add the first Book/i);
});

// @covers REQ-BOOK-001@v1
test('fifty Books are all shown, with no pagination control', async (t) => {
  const fiftyBooks = Array.from({ length: 50 }, (_, index) => aBook({ name: `Book ${index}` }));
  const library = await aRunningLibrary(t, fiftyBooks);

  const { body } = await library.get('/');

  assert.equal(countBookCards(body), 50);
  assert.doesNotMatch(body, /pagination|next page|previous page|page \d+ of/i);
});

// @covers REQ-BOOK-001@v1
test('a second tab reloaded shows a Book added since it was first opened', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'AlreadyThere' })]);
  const firstLoad = await library.get('/');
  assert.doesNotMatch(firstLoad.body, /AddedLater/);

  library.store.addBook(aBook({ name: 'AddedLater' }));
  const afterReload = await library.get('/');

  assert.match(afterReload.body, /AddedLater/);
});

// @covers REQ-BOOK-001@v1
test('the Gallery is laid out as a multi-column grid', async (t) => {
  const library = await aRunningLibrary(t, [aBook()]);

  const { body } = await library.get('/');
  const stylesheet = fs.readFileSync(path.join(PROJECT_ROOT, 'src/web/home-page.css'), 'utf8');

  assert.match(body, /class="[^"]*\bgallery\b[^"]*"/);
  assert.match(stylesheet, /\.gallery\s*\{[^}]*grid-template-columns[^}]*repeat\(/);
});

// No @covers: no acceptance criterion demands this. It is a blocking rule in
// rules/javascript/security.md — in a library application the Book Name is
// user-supplied content — and it is the reason escape-html.js exists.
test('a Book named with a script tag is shown as text, not markup', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: '<script>alert(1)</script>' })]);

  const { body } = await library.get('/');

  assert.doesNotMatch(body, /<script>alert\(1\)<\/script>/);
  assert.match(body, /&lt;script&gt;/);
});
