import test from 'node:test';
import assert from 'node:assert/strict';

import {
  aBook,
  aRunningLibrary,
  enteredValue,
  hasAddBookForm,
} from '../helpers/library-server.js';

/** The four fields the Add Book form takes, one test each. */
const ENTRY_CONTROLS = ['name', 'author', 'language', 'price'];

for (const field of ENTRY_CONTROLS) {
  // @covers REQ-BOOK-006@v1
  test(`the Add Book form presents an entry control for ${field}`, async (t) => {
    const library = await aRunningLibrary(t, []);

    const { body } = await library.get('/?add');

    assert.match(body, new RegExp(`<input[^>]*name="${field}"`));
  });
}

// @covers REQ-BOOK-006@v1
test('the Add Book form presents no entry control for Book ID', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { body } = await library.get('/?add');

  assert.doesNotMatch(body, /<input[^>]*name="(id|bookId|book_id|book-id)"/i);
});

// @covers REQ-BOOK-006@v1
test('the Add Book form presents no control for choosing a currency', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { body } = await library.get('/?add');

  assert.doesNotMatch(body, /<select/i);
  assert.doesNotMatch(body, /name="currency"/i);
});

// @covers REQ-BOOK-006@v1
test('a value already entered is still shown when the form is redisplayed', async (t) => {
  const library = await aRunningLibrary(t, []);

  // Redisplayed without the Book being accepted: Price is not a number.
  const { body } = await library.post(
    '/books',
    aBook({ name: 'Half Typed', price: 'free' }),
  );

  assert.ok(hasAddBookForm(body), 'the form should come back');
  assert.equal(enteredValue(body, 'name'), 'Half Typed');
  assert.equal(enteredValue(body, 'author'), 'Humayun Ahmed');
});

// @covers REQ-BOOK-006@v1
test('a Language not drawn from any predefined list is accepted', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status } = await library.post('/books', aBook({ language: 'Chakma' }));

  assert.equal(status, 303);
  assert.equal(library.store.listBooks()[0].language, 'Chakma');
});

// @covers REQ-BOOK-006@v1
test('a Price that is not a number is refused', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status, body } = await library.post('/books', aBook({ price: 'free' }));

  assert.equal(status, 422);
  assert.match(body, /Price/);
});

for (const field of ENTRY_CONTROLS) {
  // @covers REQ-BOOK-006@v1
  test(`a submission with no ${field} is refused`, async (t) => {
    const library = await aRunningLibrary(t, []);

    const { status } = await library.post('/books', aBook({ [field]: '' }));

    assert.equal(status, 422);
    assert.deepEqual(library.store.listBooks(), []);
  });
}

// @covers REQ-BOOK-006@v1
test('the Add Book form can be submitted with no sign-in step', async (t) => {
  const library = await aRunningLibrary(t, []);

  const opened = await library.get('/?add');
  const { status } = await library.post('/books', aBook());

  assert.doesNotMatch(opened.body, /sign in|log in|password/i);
  assert.equal(status, 303);
});
