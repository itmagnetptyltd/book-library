import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { createLibraryStore } from '../../src/library/library-store.js';
import { startServer } from '../../src/server.js';

/**
 * @param {Partial<{name: string, author: string, language: string, price: string}>} [overrides]
 */
export function aBook(overrides = {}) {
  return {
    name: 'Nondito Noroke',
    author: 'Humayun Ahmed',
    language: 'Bengali',
    price: '350.00',
    ...overrides,
  };
}

/**
 * A running application over a Library of its own, on an ephemeral port.
 *
 * Shut down in the order the operating system needs: server first, then the
 * store, then the directory. An open SQLite handle locks the file on Windows —
 * see .brain/constraints/windows-locks-open-sqlite-files.md. Any test that opens
 * a database file must use this helper rather than registering its own cleanup.
 *
 * @param {import('node:test').TestContext} t
 * @param {Array<object>} [books] Books to put in the Library before it starts
 */
export async function aRunningLibrary(t, books = []) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'book-library-server-'));
  const databaseFile = path.join(directory, 'library.db');

  let store = createLibraryStore(databaseFile);
  for (const book of books) {
    store.addBook(book);
  }
  let running = await startServer({ store, port: 0 });

  /** Handles a test opened itself, closed before the directory is removed. */
  const alsoOpen = [];

  t.after(async () => {
    await running.close();
    for (const handle of [store, ...alsoOpen]) {
      try {
        handle.close();
      } catch {
        // already closed by the test, which is fine
      }
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });

  const library = {
    databaseFile,

    get store() {
      return store;
    },

    get url() {
      return running.url;
    },

    /** Track a handle the test opened, so it is closed before the directory goes. */
    track(closable) {
      alsoOpen.push(closable);
      return closable;
    },

    /**
     * Stop the application and start it again over the same database file.
     * The port changes; nothing about the Library should.
     */
    async restart() {
      await running.close();
      store.close();
      store = createLibraryStore(databaseFile);
      running = await startServer({ store, port: 0 });
      return library;
    },

    /**
     * @param {string} [pathname]
     * @returns {Promise<{status: number, body: string, headers: Headers}>}
     */
    async get(pathname = '/') {
      const response = await fetch(new URL(pathname, running.url));
      return { status: response.status, body: await response.text(), headers: response.headers };
    },

    /**
     * Submit a form.
     *
     * `redirect` defaults to 'manual' so a test can assert the 303 itself. Pass
     * 'follow' to behave as a browser does and land on the page that results.
     *
     * @param {string} pathname
     * @param {Record<string, string>|string} fields
     * @param {{redirect?: RequestRedirect, headers?: Record<string, string>, contentType?: string}} [options]
     */
    async post(pathname, fields, options = {}) {
      const { redirect = 'manual', headers = {}, contentType } = options;
      const response = await fetch(new URL(pathname, running.url), {
        method: 'POST',
        redirect,
        headers: {
          'content-type': contentType ?? 'application/x-www-form-urlencoded',
          ...headers,
        },
        body: typeof fields === 'string' ? fields : new URLSearchParams(fields).toString(),
      });
      return { status: response.status, body: await response.text(), headers: response.headers };
    },
  };

  return library;
}

/**
 * How many Book cards the markup carries.
 *
 * @param {string} html
 * @returns {number}
 */
export function countBookCards(html) {
  return (html.match(/class="[^"]*\bbook-card\b[^"]*"/g) ?? []).length;
}

/**
 * How many Delete controls the markup carries. Counts the control on a Book
 * card only, never the confirmation's own button.
 *
 * @param {string} html
 * @returns {number}
 */
export function countDeleteControls(html) {
  return (html.match(/class="[^"]*\bbook-card__delete\b[^"]*"/g) ?? []).length;
}

/**
 * Whether the Add Book form is present in the markup.
 *
 * @param {string} html
 * @returns {boolean}
 */
export function hasAddBookForm(html) {
  return /class="[^"]*\badd-book-form\b[^"]*"/.test(html);
}

/**
 * Whether a delete confirmation is being asked for.
 *
 * @param {string} html
 * @returns {boolean}
 */
export function hasDeleteConfirmation(html) {
  return /class="[^"]*\bdelete-confirmation\b[^"]*"/.test(html);
}

/**
 * The value an entry control carries in the rendered form.
 *
 * @param {string} html
 * @param {string} field
 * @returns {string|null}
 */
export function enteredValue(html, field) {
  const match = html.match(new RegExp(`<input[^>]*name="${field}"[^>]*>`));
  if (match === null) {
    return null;
  }
  const value = match[0].match(/value="([^"]*)"/);
  return value === null ? '' : value[1];
}
