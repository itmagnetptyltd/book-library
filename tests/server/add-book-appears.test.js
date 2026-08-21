import test from 'node:test';
import assert from 'node:assert/strict';

import { aBook, aRunningLibrary, countBookCards } from '../helpers/library-server.js';

// @covers REQ-BOOK-008@v1
test('a Book appears in the Gallery once the submission completes', async (t) => {
  const library = await aRunningLibrary(t, []);

  // redirect: 'follow' is what a browser does with the 303, so the person takes
  // no further action of their own.
  const { status, body } = await library.post(
    '/books',
    aBook({ name: 'JustAdded' }),
    { redirect: 'follow' },
  );

  assert.equal(status, 200);
  assert.equal(countBookCards(body), 1);
  assert.match(body, /JustAdded/);
});

// @covers REQ-BOOK-008@v1
test('a second tab reloaded shows a Book added in the first', async (t) => {
  const library = await aRunningLibrary(t, []);
  const secondTabBefore = await library.get('/');
  assert.doesNotMatch(secondTabBefore.body, /AddedInTheFirstTab/);

  await library.post('/books', aBook({ name: 'AddedInTheFirstTab' }));
  const secondTabAfterReload = await library.get('/');

  assert.match(secondTabAfterReload.body, /AddedInTheFirstTab/);
});
