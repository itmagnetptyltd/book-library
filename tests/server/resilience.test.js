import test from 'node:test';
import assert from 'node:assert/strict';

import { startServer } from '../../src/server.js';
import { aBook, aRunningLibrary } from '../helpers/library-server.js';

// No @covers: no acceptance criterion says "the process must not die". These
// are regression tests for defects found in review, each of which took the
// whole application down or corrupted data while every existing test stayed
// green. If one of these ever fails by crashing the runner rather than
// reporting, that is the defect returning.

/**
 * A Library whose every operation fails, standing in for the SQLITE_BUSY that
 * .brain/constraints/windows-locks-open-sqlite-files.md records as real here.
 */
function aFailingLibrary() {
  const explode = () => {
    throw new Error('SQLITE_BUSY: database is locked');
  };
  return { listBooks: explode, addBook: explode, deleteBook: explode };
}

test('a Library that fails while rendering the Home page answers 500 rather than killing the application', async (t) => {
  const running = await startServer({ store: aFailingLibrary(), port: 0 });
  t.after(() => running.close());

  const response = await fetch(new URL('/', running.url));

  assert.equal(response.status, 500);
  assert.equal(running.server.listening, true, 'the application must still be serving');
});

test('a Library that fails while a Book is submitted answers 500 rather than killing the application', async (t) => {
  const running = await startServer({ store: aFailingLibrary(), port: 0 });
  t.after(() => running.close());

  const response = await fetch(new URL('/books', running.url), {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(aBook()).toString(),
    redirect: 'manual',
  });

  assert.equal(response.status, 500);
  assert.equal(running.server.listening, true, 'the application must still be serving');
});

test('a Library that fails while a Book is deleted answers 500 rather than killing the application', async (t) => {
  const running = await startServer({ store: aFailingLibrary(), port: 0 });
  t.after(() => running.close());

  const response = await fetch(new URL('/books/delete', running.url), {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id: '1' }).toString(),
    redirect: 'manual',
  });

  assert.equal(response.status, 500);
  assert.equal(running.server.listening, true, 'the application must still be serving');
});

test('a Book ID too long to be a number is refused, and the application keeps serving', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Survives' })]);

  // 320 digits parses to Infinity, which is not a whole number.
  const { status } = await library.post('/books/delete', { id: '9'.repeat(320) });

  assert.equal(status, 422);
  assert.equal(library.store.listBooks().length, 1);
});

test('asking to confirm a Book ID too long to be a number shows no confirmation', async (t) => {
  const library = await aRunningLibrary(t, [aBook({ name: 'Survives' })]);

  const { status, body } = await library.get(`/?delete=${'9'.repeat(320)}`);

  assert.equal(status, 200);
  assert.doesNotMatch(body, /delete-confirmation/);
});
