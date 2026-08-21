import test from 'node:test';
import assert from 'node:assert/strict';

import { aBook, aRunningLibrary } from '../helpers/library-server.js';

// None of these carry @covers: no acceptance criterion demands them. They are
// rules from rules/javascript/security.md and ADR-0003.

test('the confirmation shows a Book Name containing a script tag as text', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: '<script>alert(1)</script>' })]);
  const [book] = library.store.listBooks();

  const { body } = await library.get(`/?delete=${book.id}`);

  assert.doesNotMatch(body, /<script>alert\(1\)<\/script>/);
  assert.match(body, /&lt;script&gt;/);
});

test('a cross-site delete is refused', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Protected' })]);
  const [book] = library.store.listBooks();

  const { status } = await library.post(
    '/books/delete',
    { id: String(book.id) },
    { headers: { 'sec-fetch-site': 'cross-site' } },
  );

  assert.equal(status, 403);
  assert.equal(library.store.listBooks().length, 1);
});

test('a delete carrying a Book ID that is not a whole number is refused', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Safe' })]);

  const { status } = await library.post('/books/delete', { id: 'one; DROP TABLE books' });

  assert.equal(status, 422);
  assert.equal(library.store.listBooks().length, 1);
});

test('a delete carrying an unexpected field is refused', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Safe' })]);
  const [book] = library.store.listBooks();

  const { status } = await library.post('/books/delete', {
    id: String(book.id),
    everything: 'true',
  });

  assert.equal(status, 422);
  assert.equal(library.store.listBooks().length, 1);
});

test('deleting through a GET is refused', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Not Prefetchable' })]);
  const [book] = library.store.listBooks();

  // A side-effecting GET is how a link prefetcher empties a Library.
  const { status } = await library.get(`/books/delete?id=${book.id}`);

  assert.equal(status, 404);
  assert.equal(library.store.listBooks().length, 1);
});

test('asking to confirm a Book ID that is not in the Library shows no confirmation', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Present' })]);

  const { status, body } = await library.get('/?delete=99999');

  assert.equal(status, 200);
  assert.doesNotMatch(body, /delete-confirmation/);
});
