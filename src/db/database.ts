import { createDbWorker } from 'sql.js-httpvfs';

const workerUrl = new URL(
  'sql.js-httpvfs/dist/sqlite.worker.js',
  import.meta.url
);
const wasmUrl = new URL('sql.js-httpvfs/dist/sql-wasm.wasm', import.meta.url);

const worker = await createDbWorker(
  [
    {
      from: 'inline',
      config: {
        serverMode: 'full',
        url: '/company.sqlite3',
        requestChunkSize: 4096,
      },
    },
  ],
  workerUrl.toString(),
  wasmUrl.toString()
);

// Initialize tables
await worker.db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    payRate REAL NOT NULL,
    contactDetails TEXT
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    dateCreated TEXT NOT NULL,
    dueDate TEXT,
    assignedTo INTEGER,
    FOREIGN KEY (assignedTo) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  );
`);

export default worker.db;