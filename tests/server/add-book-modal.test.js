import test from 'node:test';
import assert from 'node:assert/strict';

import { aBook, aRunningLibrary, countBookCards, hasAddBookForm } from '../helpers/library-server.js';

// @covers REQ-BOOK-004@v1
test('the Home page carries a control labelled "+ Add Book"', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { body } = await library.get('/');

  assert.match(body, /\+ Add Book/);
});

// @covers REQ-BOOK-005@v1
test('activating the Add Book control shows the form as a modal over the Home page', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'AlreadyThere' })]);

  const { body } = await library.get('/?add');

  assert.ok(hasAddBookForm(body), 'the Add Book form should be shown');
  assert.match(body, /class="[^"]*\bmodal\b[^"]*"/, 'the form should be shown as a modal');
  assert.equal(countBookCards(body), 1, 'the Home page should still be behind it, not replaced');
});

// @covers REQ-BOOK-005@v1
test('the Add Book form is not shown when the Home page is first opened', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { body } = await library.get('/');

  assert.equal(hasAddBookForm(body), false);
});

// @covers REQ-BOOK-005@v1
test('the Add Book form is no longer shown once a Book has been added', async (t) => {
  const library = await aRunningLibrary(t, []);

  const submission = await library.post('/books', aBook({ name: 'Deyal' }));
  const landed = await library.get(submission.headers.get('location') ?? '/');

  assert.equal(submission.status, 303);
  assert.equal(hasAddBookForm(landed.body), false);
});
