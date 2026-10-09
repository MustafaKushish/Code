-- Tabellen für die Auftrags-API.
-- "orders" existiert in der bestehenden Datenbank bereits – CREATE TABLE IF NOT EXISTS lässt sie unverändert.
-- Neu ist nur "rate_limits" (Schutz gegen das Durchprobieren von Auftragsnummern und Schlüsseln).

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TEXT,
  serviceDate TEXT,
  isoDate TEXT,
  cust TEXT,
  phone TEXT,
  address TEXT,
  device TEXT,
  serial TEXT,
  payMethod TEXT,
  isB2B INTEGER,
  b2bDiscountPercent REAL,
  b2bDiscountVal REAL,
  rawSubtotalNet REAL,
  min REAL,
  partEK REAL,
  partVKNet REAL,
  netto REAL,
  taxRate REAL,
  taxAmount REAL,
  brutto REAL,
  profit REAL,
  status TEXT,
  paid TEXT
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
