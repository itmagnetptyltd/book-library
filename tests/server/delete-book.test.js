import test from 'node:test';
import assert from 'node:assert/strict';

import { createLibraryStore } from '../../src/library/library-store.js';
import { aBook, aRunningLibrary, hasDeleteConfirmation } from '../helpers/library-server.js';

// @covers REQ-BOOK-009@v1
test('confirming a deletion removes that Book from the Library', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Doomed' })]);
  const [book] = library.store.listBooks();

  await library.post('/books/delete', { id: String(book.id) });

  assert.deepEqual(library.store.listBooks(), []);
});

// @covers REQ-BOOK-009@v1
test('deleting one of two Books leaves the other unchanged', async (t) => {
  const library = await aRunningLibrary(t, [
    aBook({ name: 'Kept', author: 'Humayun Ahmed', language: 'Bengali', price: '350.00' }),
    aBook({ name: 'Removed' }),
  ]);
  const removed = library.store.listBooks().find((book) => book.name === 'Removed');

  await library.post('/books/delete', { id: String(removed.id) });

  const survivors = library.store.listBooks();
  assert.equal(survivors.length, 1);
  assert.equal(survivors[0].name, 'Kept');
  assert.equal(survivors[0].author, 'Humayun Ahmed');
  assert.equal(survivors[0].language, 'Bengali');
  assert.equal(survivors[0].price, '350.00');
});

// @covers REQ-BOOK-009@v1
test('activating the Delete control asks for confirmation and deletes nothing', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Still Here' })]);
  const [book] = library.store.listBooks();

  const { body } = await library.get(`/?delete=${book.id}`);

  assert.ok(hasDeleteConfirmation(body), 'a confirmation should be asked for');
  assert.match(body, /Still Here/, 'the confirmation should name the Book');
  assert.equal(library.store.listBooks().length, 1, 'activating the control must not delete');
});

// @covers REQ-BOOK-009@v1
test('declining the confirmation leaves the Book in the Library', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Reprieved' })]);
  const [book] = library.store.listBooks();
  await library.get(`/?delete=${book.id}`);

  // Declining is the Cancel link: back to the Home page, nothing submitted.
  const { body } = await library.get('/');

  assert.equal(hasDeleteConfirmation(body), false);
  assert.deepEqual(
    library.store.listBooks().map((entry) => entry.name),
    ['Reprieved'],
  );
});

// @covers REQ-BOOK-009@v1
test('a deleted Book is still gone after the application is restarted', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Gone For Good' })]);
  const [book] = library.store.listBooks();
  await library.post('/books/delete', { id: String(book.id) });
  library.store.close();

  const afterRestart = library.track(createLibraryStore(library.databaseFile));

  assert.deepEqual(afterRestart.listBooks(), []);
});

// @covers REQ-BOOK-009@v1
test('a Book can be deleted with no sign-in step', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'No Credentials' })]);
  const [book] = library.store.listBooks();

  const { status } = await library.post('/books/delete', { id: String(book.id) });

  assert.equal(status, 303);
  assert.deepEqual(library.store.listBooks(), []);
});
