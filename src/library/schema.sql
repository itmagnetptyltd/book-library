-- The Library. One row per Book.
--
-- AUTOINCREMENT is deliberate and must not be reduced to a bare
-- INTEGER PRIMARY KEY. SQLite reuses rowids once the highest row is deleted, so
-- deleting the last Book and adding another would hand the new Book the dead
-- one's Book ID. REQ-BOOK-007 forbids exactly that. AUTOINCREMENT keeps a high
-- water mark so an issued Book ID is permanently spent.
--
-- price_minor holds poisha, not taka: an integer count of hundredths. Prices are
-- always BDT and always shown to two decimal places (REQ-BOOK-002), and storing
-- a decimal as REAL is floating point, which does not reliably survive a round
-- trip. The store converts at its boundary; no other module sees poisha.

CREATE TABLE IF NOT EXISTS books (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  author      TEXT    NOT NULL,
  language    TEXT    NOT NULL,
  price_minor INTEGER NOT NULL
);
