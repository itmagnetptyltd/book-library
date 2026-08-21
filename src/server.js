import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderHomePage } from './web/render-home-page.js';
import { createLibraryStore } from './library/library-store.js';
import { validateBookDetails } from './library/validate-book-details.js';
import { readFormBody } from './http/read-form-body.js';
import { resolveDatabaseFile } from './config.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STYLESHEET_FILE = path.join(HERE, 'web', 'home-page.css');

/** Loopback only. The application is not reachable from another machine. */
export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 3000;

/**
 * A Book ID as it arrives from a URL or a form: digits, nothing else, and few
 * enough of them to be a number. Unbounded digits parse to Infinity, which is
 * not a whole number and which the store refuses by throwing.
 */
const BOOK_ID_PATTERN = /^\d{1,15}$/;

const SECURITY_HEADERS = Object.freeze({
  'x-content-type-options': 'nosniff',
  'content-security-policy': "default-src 'self'",
});

/**
 * The request handler.
 *
 * Routes are fixed URLs mapping to known responses. There is no static file
 * server and nothing joins a caller-supplied string to a path, so traversal is
 * impossible rather than defended against (ADR-0002). Both modals take their
 * visibility from the URL rather than from a script (ADR-0003).
 *
 * @param {{listBooks: () => ReadonlyArray<object>,
 *          addBook: (details: object) => object,
 *          deleteBook: (id: number) => boolean}} store
 * @returns {import('node:http').RequestListener}
 */
export function createApp(store) {
  return function handleRequest(request, response) {
    try {
      route(request, response, store);
    } catch (error) {
      failRequest(response, error);
    }
  };
}

/**
 * @param {import('node:http').IncomingMessage} request
 * @param {import('node:http').ServerResponse} response
 * @param {object} store
 */
function route(request, response, store) {
  const url = new URL(request.url ?? '/', `http://${DEFAULT_HOST}`);

  if (request.method === 'GET' && url.pathname === '/') {
    sendHomePage(response, 200, store, homePageModal(store, url));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/home-page.css') {
    send(response, 200, 'text/css; charset=utf-8', fs.readFileSync(STYLESHEET_FILE, 'utf8'));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/books') {
    addBook(request, response, store).catch((error) => failRequest(response, error));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/books/delete') {
    deleteBook(request, response, store).catch((error) => failRequest(response, error));
    return;
  }

  send(response, 404, 'text/plain; charset=utf-8', 'Not found');
}

/**
 * The error boundary. Without it a single failing request takes the whole
 * application down: a synchronous throw becomes an uncaught exception, and a
 * rejection from an async handler becomes an unhandled rejection, both of which
 * end the process and disconnect every other person using it.
 *
 * The cause is written to stderr because a 500 with no trace anywhere is not
 * diagnosable; the caller is told nothing but that it failed.
 *
 * @param {import('node:http').ServerResponse} response
 * @param {unknown} error
 */
function failRequest(response, error) {
  process.stderr.write(`Request failed: ${error instanceof Error ? error.stack : String(error)}\n`);

  if (response.headersSent) {
    response.end();
    return;
  }

  send(response, 500, 'text/plain; charset=utf-8', 'Something went wrong.');
}

/**
 * Which modal, if any, the URL is asking for. At most one.
 *
 * @param {{listBooks: () => ReadonlyArray<object>}} store
 * @param {URL} url
 * @returns {{addBookForm: object|null, confirmDelete: object|null}}
 */
function homePageModal(store, url) {
  if (url.searchParams.has('add')) {
    return { addBookForm: {}, confirmDelete: null };
  }

  if (url.searchParams.has('delete')) {
    return { addBookForm: null, confirmDelete: bookToConfirm(store, url.searchParams.get('delete')) };
  }

  return { addBookForm: null, confirmDelete: null };
}

/**
 * The Book a confirmation is being asked about, or null if there is no such
 * Book. A Book ID that names nothing simply has nothing to confirm.
 *
 * @param {{listBooks: () => ReadonlyArray<object>}} store
 * @param {string|null} rawId
 * @returns {object|null}
 */
function bookToConfirm(store, rawId) {
  if (rawId === null || !BOOK_ID_PATTERN.test(rawId)) {
    return null;
  }

  const id = Number.parseInt(rawId, 10);
  return store.listBooks().find((book) => book.id === id) ?? null;
}

/**
 * Cross-site request forgery: every current browser sends this header and no
 * non-browser client does, so an absent header is allowed and a cross-site one
 * is not (ADR-0003).
 *
 * @param {import('node:http').IncomingMessage} request
 * @returns {boolean}
 */
function isCrossSite(request) {
  const site = request.headers['sec-fetch-site'];
  return site !== undefined && site !== 'same-origin';
}

/**
 * Add a Book from a submitted form.
 *
 * @param {import('node:http').IncomingMessage} request
 * @param {import('node:http').ServerResponse} response
 * @param {{listBooks: () => ReadonlyArray<object>, addBook: (details: object) => object}} store
 */
async function addBook(request, response, store) {
  if (isCrossSite(request)) {
    send(response, 403, 'text/plain; charset=utf-8', 'Refused.');
    return;
  }

  const body = await readFormBody(request);
  if (!body.ok) {
    send(response, body.status, 'text/plain; charset=utf-8', body.message);
    return;
  }

  const checked = validateBookDetails(body.fields);
  if (!checked.ok) {
    sendHomePage(response, 422, store, {
      addBookForm: { values: body.fields, errors: checked.errors },
      confirmDelete: null,
    });
    return;
  }

  try {
    store.addBook(checked.details);
  } catch {
    // The validator and the store agree on what a Book needs, so reaching here
    // is a defect rather than a person's mistake. Say nothing about the cause.
    send(response, 500, 'text/plain; charset=utf-8', 'The Book could not be added.');
    return;
  }

  redirectHome(response);
}

/**
 * Delete the Book a confirmed form names.
 *
 * @param {import('node:http').IncomingMessage} request
 * @param {import('node:http').ServerResponse} response
 * @param {{deleteBook: (id: number) => boolean}} store
 */
async function deleteBook(request, response, store) {
  if (isCrossSite(request)) {
    send(response, 403, 'text/plain; charset=utf-8', 'Refused.');
    return;
  }

  const body = await readFormBody(request);
  if (!body.ok) {
    send(response, body.status, 'text/plain; charset=utf-8', body.message);
    return;
  }

  const fields = Object.keys(body.fields);
  if (fields.length !== 1 || fields[0] !== 'id' || !BOOK_ID_PATTERN.test(body.fields.id)) {
    send(response, 422, 'text/plain; charset=utf-8', 'A Book ID is required.');
    return;
  }

  // A Book ID that names nothing still leaves the Library in the state asked
  // for, and answering 404 would reveal which Book IDs exist.
  store.deleteBook(Number.parseInt(body.fields.id, 10));

  redirectHome(response);
}

/**
 * See other, so refreshing the page that results does not submit again. The
 * browser follows it, which both closes the modal and shows the Gallery.
 *
 * @param {import('node:http').ServerResponse} response
 */
function redirectHome(response) {
  response.writeHead(303, { ...SECURITY_HEADERS, location: '/' });
  response.end();
}

/**
 * @param {import('node:http').ServerResponse} response
 * @param {number} status
 * @param {{listBooks: () => ReadonlyArray<object>}} store
 * @param {{addBookForm: object|null, confirmDelete: object|null}} modal
 */
function sendHomePage(response, status, store, modal) {
  const html = renderHomePage({ books: store.listBooks(), ...modal });
  send(response, status, 'text/html; charset=utf-8', html);
}

/**
 * @param {import('node:http').ServerResponse} response
 * @param {number} status
 * @param {string} contentType
 * @param {string} body
 */
function send(response, status, contentType, body) {
  response.writeHead(status, { ...SECURITY_HEADERS, 'content-type': contentType });
  response.end(body);
}

/**
 * Start serving the Library.
 *
 * @param {{store: object, host?: string, port?: number}} options
 * @returns {Promise<{server: import('node:http').Server, url: string, close: () => Promise<void>}>}
 */
export function startServer({ store, host = DEFAULT_HOST, port = DEFAULT_PORT } = {}) {
  if (store === null || typeof store !== 'object') {
    throw new Error('The application needs a Library to serve.');
  }

  const server = http.createServer(createApp(store));

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      const address = server.address();
      resolve({
        server,
        url: `http://${host}:${address.port}`,
        close: () => new Promise((closed) => server.close(() => closed())),
      });
    });
  });
}

const startedDirectly =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (startedDirectly) {
  const store = createLibraryStore(resolveDatabaseFile());
  const running = await startServer({ store });
  process.stdout.write(`Book Library is serving on ${running.url}\n`);
}
