import test from 'node:test';
import assert from 'node:assert/strict';

import { aBook, aRunningLibrary, countBookCards, countDeleteControls } from '../helpers/library-server.js';

// @covers REQ-BOOK-003@v1
test('a Book card carries a Delete control', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Nondito Noroke' })]);

  const { body } = await library.get('/');

  assert.equal(countDeleteControls(body), 1);
});

// @covers REQ-BOOK-003@v1
test('three Books produce three Delete controls, one on each Book card', async (t) => {
  const library = await aRunningLibrary(t, [
    aBook({ name: 'One' }),
    aBook({ name: 'Two' }),
    aBook({ name: 'Three' }),
  ]);

  const { body } = await library.get('/');

  assert.equal(countBookCards(body), 3);
  assert.equal(countDeleteControls(body), 3);
});

// @covers REQ-BOOK-003@v1
test('a Book card carries exactly one Delete control, not two', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Only One' })]);

  const { body } = await library.get('/');

  const card = body.match(/<li class="book-card">[\s\S]*?<\/li>/);
  assert.ok(card !== null, 'expected a Book card in the Gallery');
  assert.equal(countDeleteControls(card[0]), 1);
});
