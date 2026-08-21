import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';

import { createLibraryStore } from '../../src/library/library-store.js';
import { DEFAULT_DATABASE_FILE, PROJECT_ROOT, resolveDatabaseFile } from '../../src/config.js';

const STORE_MODULE = '../../src/library/library-store.js';

/**
 * A database file in a directory of its own, removed when the test ends.
 * Each test builds its own, so the suite passes in any order and in parallel.
 *
 * Anything handed to `track` is closed before the directory is removed. On
 * Windows an open SQLite handle keeps the file locked, so closing first is not
 * tidiness — `rm` fails with EBUSY otherwise.
 *
 * @param {import('node:test').TestContext} t
 * @returns {{file: string, track: <T extends {close: () => void}>(closable: T) => T}}
 */
function aFreshDatabaseFile(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'book-library-test-'));
  const openHandles = [];

  t.after(() => {
    for (const handle of openHandles) {
      // Already closed by the test itself is the normal case, not an error.
      try {
        handle.close();
      } catch {
        // nothing to do: the handle is gone, which is what we wanted
      }
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });

  return {
    file: path.join(directory, 'library.db'),
    track(closable) {
      openHandles.push(closable);
      return closable;
    },
  };
}

/**
 * @param {Partial<{name: string, author: string, language: string, price: string}>} [overrides]
 */
function aBook(overrides = {}) {
  return {
    name: 'Nondito Noroke',
    author: 'Humayun Ahmed',
    language: 'Bengali',
    price: '350.00',
    ...overrides,
  };
}

// A counter rather than a timestamp, so a re-import is deterministic.
let importCount = 0;

// @covers REQ-BOOK-012@v1
test('a Book added through one store handle is returned by a later one', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const first = track(createLibraryStore(file));
  first.addBook(aBook());
  first.close();

  const second = track(createLibraryStore(file));
  const books = second.listBooks();

  assert.equal(books.length, 1);
  assert.equal(books[0].name, 'Nondito Noroke');
  assert.equal(books[0].author, 'Humayun Ahmed');
  assert.equal(books[0].language, 'Bengali');
  assert.equal(books[0].price, '350.00');
});

// @covers REQ-BOOK-012@v1
test('a Book survives the application being stopped and started again', async (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const before = track(createLibraryStore(file));
  before.addBook(aBook({ name: 'Deyal' }));
  before.close();

  // Re-import the module with no shared state, standing in for a fresh process.
  const reloaded = await import(`${STORE_MODULE}?restart=${(importCount += 1)}`);
  const after = track(reloaded.createLibraryStore(file));

  assert.deepEqual(
    after.listBooks().map((book) => book.name),
    ['Deyal'],
  );
});

// @covers REQ-BOOK-012@v1
test('an added Book is present in the SQLite file on disk', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const store = track(createLibraryStore(file));
  store.addBook(aBook({ name: 'Matir Moina' }));
  store.close();

  // Opened directly, outside the store module: this fails for any store that is
  // not really a SQLite file.
  const raw = track(new Database(file, { readonly: true }));
  const rows = raw.prepare('SELECT name FROM books').all();

  assert.deepEqual(rows, [{ name: 'Matir Moina' }]);
});

// @covers REQ-BOOK-012@v1
test('the Library is held in a file on the local machine, not a remote service', () => {
  const location = resolveDatabaseFile();

  assert.equal(location, DEFAULT_DATABASE_FILE);
  assert.ok(path.isAbsolute(location), 'the database location is an absolute path');
  assert.doesNotMatch(location, /:\/\//, 'the database location carries no URL scheme');
  assert.doesNotMatch(location, /^\\\\/, 'the database location is not a network share');
});

// @covers REQ-BOOK-012@v1
test('the store offers no operation that changes a stored Book', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const store = track(createLibraryStore(file));

  const operations = Object.keys(store);

  assert.deepEqual(operations.slice().sort(), ['addBook', 'close', 'deleteBook', 'listBooks']);
  for (const operation of operations) {
    assert.doesNotMatch(
      operation,
      /update|edit|patch|save|modify|replace/i,
      `the store must offer no way to change a stored Book, but offers ${operation}`,
    );
  }
});

// Supporting test. Deletion is REQ-BOOK-009's behaviour and will be annotated
// there; the store cannot be built without it, so it is exercised here without
// claiming to cover a criterion of REQ-BOOK-012.
test('a deleted Book is no longer returned by the store', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const store = track(createLibraryStore(file));
  const kept = store.addBook(aBook({ name: 'Kept' }));
  const removed = store.addBook(aBook({ name: 'Removed' }));

  const wasDeleted = store.deleteBook(removed.id);

  assert.equal(wasDeleted, true);
  assert.deepEqual(
    store.listBooks().map((book) => book.id),
    [kept.id],
  );
});

// Supporting tests for the store's own guards. The person-facing validation
// messages belong to REQ-BOOK-006 and REQ-BOOK-007 and are annotated there;
// these only assert that the store refuses to write something it cannot store.

test('a Book with no Name is refused', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const store = track(createLibraryStore(file));

  assert.throws(() => store.addBook(aBook({ name: '   ' })), /Name/);
  assert.deepEqual(store.listBooks(), []);
});

test('a Price that is not a number is refused', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const store = track(createLibraryStore(file));

  assert.throws(() => store.addBook(aBook({ price: 'free' })), /Price/);
  assert.deepEqual(store.listBooks(), []);
});

test('a Price carrying more than two decimal places is refused', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const store = track(createLibraryStore(file));

  assert.throws(() => store.addBook(aBook({ price: '350.005' })), /Price/);
});

test('a Price given without decimals is stored to two decimal places', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const store = track(createLibraryStore(file));

  assert.equal(store.addBook(aBook({ price: 350 })).price, '350.00');
  assert.equal(store.addBook(aBook({ price: '99.5' })).price, '99.50');
});

test('deleting a Book ID that is not a whole number is refused', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const store = track(createLibraryStore(file));

  assert.throws(() => store.deleteBook('1'), /whole number/);
});

test('deleting a Book that is not in the Library reports that nothing was removed', (t) => {
  const { file, track } = aFreshDatabaseFile(t);
  const store = track(createLibraryStore(file));

  assert.equal(store.deleteBook(404), false);
});

test('an empty database file path is refused', () => {
  assert.throws(() => resolveDatabaseFile('   '), /non-empty string/);
});

test('a database file path relative to the project is resolved against it', () => {
  const location = resolveDatabaseFile('src/data/other.db');

  assert.ok(path.isAbsolute(location));
  assert.equal(location, path.join(PROJECT_ROOT, 'src', 'data', 'other.db'));
});
