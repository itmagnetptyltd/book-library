import test from 'node:test';
import assert from 'node:assert/strict';

import { aBook, aRunningLibrary } from '../helpers/library-server.js';

// None of these carry @covers: no acceptance criterion demands them. They are
// rules from rules/javascript/security.md and ADR-0003, and a green suite
// without them would be reporting safety that is not there.

test('a Book Name containing a script tag is stored and shown as text', async (t) => {
  const library = await aRunningLibrary(t, []);

  await library.post('/books', aBook({ name: '<script>alert(1)</script>' }));
  const { body } = await library.get('/');

  assert.doesNotMatch(body, /<script>alert\(1\)<\/script>/);
  assert.match(body, /&lt;script&gt;/);
});

test('a value already entered is escaped when the form is redisplayed', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { body } = await library.post('/books', aBook({ name: '"><script>alert(1)</script>', price: 'free' }));

  assert.doesNotMatch(body, /<script>alert\(1\)<\/script>/);
});

test('a submission carrying an unexpected field is refused', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status } = await library.post('/books', { ...aBook(), isAdmin: 'true' });

  assert.equal(status, 422);
  assert.deepEqual(library.store.listBooks(), []);
});

test('a request body that is not form-encoded is refused', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status } = await library.post('/books', JSON.stringify(aBook()), {
    contentType: 'application/json',
  });

  assert.equal(status, 415);
  assert.deepEqual(library.store.listBooks(), []);
});

test('a request body larger than the cap is refused', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status } = await library.post('/books', aBook({ name: 'x'.repeat(64 * 1024) }));

  assert.equal(status, 413);
  assert.deepEqual(library.store.listBooks(), []);
});

test('a cross-site form submission is refused', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status } = await library.post('/books', aBook(), {
    headers: { 'sec-fetch-site': 'cross-site' },
  });

  assert.equal(status, 403);
  assert.deepEqual(library.store.listBooks(), []);
});

test('a same-origin form submission is accepted', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status } = await library.post('/books', aBook(), {
    headers: { 'sec-fetch-site': 'same-origin' },
  });

  assert.equal(status, 303);
  assert.equal(library.store.listBooks().length, 1);
});

// Regression, found in review: a Price whose whole part exceeds what JavaScript
// can hold exactly was accepted, stored through float arithmetic, and read back
// as a DIFFERENT number — silently violating REQ-BOOK-007's "the Library returns
// a Book carrying exactly those entered details".
test('a Price too large to be stored exactly is refused', async (t) => {
  const library = await aRunningLibrary(t, []);

  const { status } = await library.post('/books', aBook({ price: '99999999999999999999.00' }));

  assert.equal(status, 422);
  assert.deepEqual(library.store.listBooks(), []);
});

test('a Price at the top of what can be stored exactly still round-trips unchanged', async (t) => {
  const library = await aRunningLibrary(t, []);

  await library.post('/books', aBook({ price: '90071992547.99' }));

  assert.equal(library.store.listBooks()[0].price, '90071992547.99');
});
