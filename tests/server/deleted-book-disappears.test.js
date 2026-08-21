import test from 'node:test';
import assert from 'node:assert/strict';

import { aBook, aRunningLibrary, countBookCards } from '../helpers/library-server.js';

// @covers REQ-BOOK-010@v1
test('a deleted Book has no card when the Home page is next displayed', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Removed' }), aBook({ name: 'Kept' })]);
  const removed = library.store.listBooks().find((book) => book.name === 'Removed');

  await library.post('/books/delete', { id: String(removed.id) });
  const { body } = await library.get('/');

  assert.doesNotMatch(body, /Removed/);
  assert.equal(countBookCards(body), 1);
});

// @covers REQ-BOOK-010@v1
test('a deleted Book has no card after the application is restarted', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'RemovedBeforeRestart' })]);
  const [book] = library.store.listBooks();
  await library.post('/books/delete', { id: String(book.id) });

  await library.restart();
  const { body } = await library.get('/');

  assert.doesNotMatch(body, /RemovedBeforeRestart/);
  assert.equal(countBookCards(body), 0);
});

// @covers REQ-BOOK-010@v1
test('a second tab reloaded shows no card for a Book deleted in the first', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'SeenThenDeleted' })]);
  const secondTabBefore = await library.get('/');
  assert.match(secondTabBefore.body, /SeenThenDeleted/);
  const [book] = library.store.listBooks();

  await library.post('/books/delete', { id: String(book.id) });
  const secondTabAfterReload = await library.get('/');

  assert.doesNotMatch(secondTabAfterReload.body, /SeenThenDeleted/);
});
