import test from 'node:test';
import assert from 'node:assert/strict';

import { createLibraryStore } from '../../src/library/library-store.js';
import {
  aBook,
  aRunningLibrary,
  enteredValue,
  hasAddBookForm,
} from '../helpers/library-server.js';

// @covers REQ-BOOK-007@v1
test('a submitted Book is returned by the Library carrying exactly those details', async (t) => {
  const library = await aRunningLibrary(t, []);

  await library.post('/books', aBook({ name: 'Deyal', author: 'Humayun Ahmed', language: 'Bengali', price: '425.50' }));

  const [book] = library.store.listBooks();
  assert.equal(book.name, 'Deyal');
  assert.equal(book.author, 'Humayun Ahmed');
  assert.equal(book.language, 'Bengali');
  assert.equal(book.price, '425.50');
});

// @covers REQ-BOOK-007@v1
test('submitting a third Book leaves the Library holding three', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'One' }), aBook({ name: 'Two' })]);

  await library.post('/books', aBook({ name: 'Three' }));

  assert.equal(library.store.listBooks().length, 3);
});

// @covers REQ-BOOK-007@v1
test('a submitted Book carries a Book ID the application issued', async (t) => {
  const library = await aRunningLibrary(t, []);

  await library.post('/books', aBook());

  const [book] = library.store.listBooks();
  assert.ok(Number.isInteger(book.id), `expected an issued Book ID, got ${book.id}`);
});

// @covers REQ-BOOK-007@v1
test('no two Books in the Library carry the same Book ID', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Existing' })]);

  await library.post('/books', aBook({ name: 'Added' }));

  const ids = library.store.listBooks().map((book) => book.id);
  assert.equal(new Set(ids).size, ids.length);
});

// @covers REQ-BOOK-007@v1
test('a deleted Book ID is not reissued to a Book added later', async (t) => {
  const library = await aRunningLibrary(t, []);
  await library.post('/books', aBook({ name: 'Removed' }));
  const [removed] = library.store.listBooks();
  library.store.deleteBook(removed.id);

  await library.post('/books', aBook({ name: 'Later' }));

  const [later] = library.store.listBooks();
  assert.notEqual(later.id, removed.id);
});

// @covers REQ-BOOK-007@v1
test('a refused submission adds no Book to the Library', async (t) => {
  const library = await aRunningLibrary(t, []);

  await library.post('/books', aBook({ name: '' }));

  assert.deepEqual(library.store.listBooks(), []);
});

// @covers REQ-BOOK-007@v1
test('a refused submission shows an error naming the offending field', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { body } = await library.post('/books', aBook({ author: '' }));

  assert.ok(hasAddBookForm(body), 'the error belongs in the Add Book form');
  // Assert INSIDE the error block. Matching /Author/ against the whole page
  // passes on the field's own label, so it cannot tell a correct error from one
  // naming the wrong field.
  const errorBlock = body.match(/<ul class="form-error">[^]*?<\/ul>/);
  assert.ok(errorBlock !== null, 'an error block should be shown');
  assert.match(errorBlock[0], /Author is required\./);
  assert.doesNotMatch(errorBlock[0], /Name is required\./);
});

// @covers REQ-BOOK-007@v1
test('a refused submission still shows the values already entered', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { body } = await library.post(
    '/books',
    { name: 'Nondito Noroke', author: '', language: 'Bengali', price: '350' },
  );

  assert.equal(enteredValue(body, 'name'), 'Nondito Noroke');
  assert.equal(enteredValue(body, 'language'), 'Bengali');
  assert.equal(enteredValue(body, 'price'), '350');
});

// @covers REQ-BOOK-007@v1
test('a Book added through the form survives the application being restarted', async (t) => {
  const library = await aRunningLibrary(t, []);
  await library.post('/books', aBook({ name: 'Persisted' }));
  library.store.close();

  const afterRestart = library.track(createLibraryStore(library.databaseFile));

  assert.deepEqual(
    afterRestart.listBooks().map((book) => book.name),
    ['Persisted'],
  );
});

// @covers REQ-BOOK-007@v1
test('a Book can be added with no sign-in step', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status } = await library.post('/books', aBook({ name: 'No Credentials' }));

  assert.equal(status, 303);
  assert.equal(library.store.listBooks().length, 1);
});

// @covers REQ-BOOK-007@v1
test('a Book card offers no control for changing that Book\'s details', async (t) => {
  const library = await aRunningLibrary(t, []);
  await library.post('/books', aBook({ name: 'Fixed' }));

  const { body } = await library.get('/');

  assert.doesNotMatch(body, /\b(edit|update|modify|change) book\b/i);
  assert.doesNotMatch(body, /href="[^"]*\/edit/i);
});
