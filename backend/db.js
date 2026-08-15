const { DatabaseSync } = require('node:sqlite');
const path = require('path');
require('dotenv').config();

class BetterSQLite3Adapter {
  constructor(dbPath) {
    this.rawDb = new DatabaseSync(path.resolve(dbPath));
  }

  pragma(sql) {
    return this.rawDb.exec(`PRAGMA ${sql}`);
  }

  exec(sql) {
    return this.rawDb.exec(sql);
  }

  prepare(sql) {
    const stmt = this.rawDb.prepare(sql);
    return {
      run: (...params) => stmt.run(...params),
      get: (...params) => stmt.get(...params),
      all: (...params) => stmt.all(...params)
    };
  }

  transaction(fn) {
    return (...args) => {
      this.rawDb.exec('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        this.rawDb.exec('COMMIT');
        return result;
      } catch (err) {
        this.rawDb.exec('ROLLBACK');
        throw err;
      }
    };
  }

  close() {
    this.rawDb.close();
  }
}

const dbPath = process.env.DB_PATH || 'quietpaws.db';
const db = new BetterSQLite3Adapter(dbPath);

// Enable WAL mode and foreign key constraints
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Check schema compatibility: if old collectibles schema exists without 'type', reset tables
try {
  const tableInfo = db.prepare("PRAGMA table_info(collectibles)").all();
  const hasTypeColumn = tableInfo.some(col => col.name === 'type');
  if (tableInfo.length > 0 && !hasTypeColumn) {
    db.exec("DROP TABLE IF EXISTS user_collectibles");
    db.exec("DROP TABLE IF EXISTS sessions");
    db.exec("DROP TABLE IF EXISTS collectibles");
    db.exec("DROP TABLE IF EXISTS users");
  }
} catch (e) {}

// Create SQLite tables matching the exact schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    last_completed_day TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS collectibles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('cat', 'piece')),
    name TEXT NOT NULL,
    detail TEXT,
    image_url TEXT NOT NULL,
    order_index INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_collectibles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    collectible_id INTEGER NOT NULL,
    unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (collectible_id) REFERENCES collectibles(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    duration_min INTEGER NOT NULL,
    intention TEXT,
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reward_type TEXT,
    reward_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed 12 cats and 12 pieces if collectibles table is empty
const countRow = db.prepare('SELECT COUNT(*) as count FROM collectibles').get();
if (countRow.count === 0) {
  const seedCollectibles = [
    // 12 Cats
    ['cat', 'Mochi', 'Naps in sunbeams, ignores everyone', '/assets/cats/mochi.png', 1],
    ['cat', 'Biscuit', 'Judges your life choices silently', '/assets/cats/biscuit.png', 2],
    ['cat', 'Luna', 'Watches the night sky with curiosity', '/assets/cats/luna.png', 3],
    ['cat', 'Oliver', 'Always ready for a gentle purr', '/assets/cats/oliver.png', 4],
    ['cat', 'Cleo', 'Sits like royalty on cozy cushions', '/assets/cats/cleo.png', 5],
    ['cat', 'Simba', 'Brave little explorer of quiet corners', '/assets/cats/simba.png', 6],
    ['cat', 'Peanut', 'Small, playful, and loves cardboards', '/assets/cats/peanut.png', 7],
    ['cat', 'Whiskers', 'Master of peaceful cat naps', '/assets/cats/whiskers.png', 8],
    ['cat', 'Jasper', 'Quietly observes the room from above', '/assets/cats/jasper.png', 9],
    ['cat', 'Hazel', 'Loves warm tea steam and quiet rooms', '/assets/cats/hazel.png', 10],
    ['cat', 'Willow', 'Soft purrs that soothe your stress', '/assets/cats/willow.png', 11],
    ['cat', 'Ziggy', 'Chases dust motes in gentle light', '/assets/cats/ziggy.png', 12],

    // 12 Furniture Pieces
    ['piece', 'A soft rug', 'Warms up the floor', '/assets/pieces/rug.png', 1],
    ['piece', 'Oak Coffee Table', 'Sturdy surface for warm tea', '/assets/pieces/coffee_table.png', 2],
    ['piece', 'Armchair', 'Plush seat for quiet reading', '/assets/pieces/armchair.png', 3],
    ['piece', 'Floor Lamp', 'Casts a warm, soothing glow', '/assets/pieces/lamp.png', 4],
    ['piece', 'Plant Stand', 'Holds lush green houseplants', '/assets/pieces/plant_stand.png', 5],
    ['piece', 'Cushion', 'Soft accent for cozy corners', '/assets/pieces/cushion.png', 6],
    ['piece', 'Bookcase', 'Filled with peaceful stories', '/assets/pieces/bookcase.png', 7],
    ['piece', 'Tea Set', 'Ceramic teapot and two cups', '/assets/pieces/tea_set.png', 8],
    ['piece', 'Wall Clock', 'Ticks softly in rhythm with your breath', '/assets/pieces/clock.png', 9],
    ['piece', 'Cat Bed', 'Warm fleece nest for furry friends', '/assets/pieces/cat_bed.png', 10],
    ['piece', 'Knit Blanket', 'Handmade throw for chilly afternoons', '/assets/pieces/blanket.png', 11],
    ['piece', 'Golden Bell', 'Chimes gently with the breeze', '/assets/pieces/golden_bell.png', 12]
  ];

  const insertStmt = db.prepare(`
    INSERT INTO collectibles (type, name, detail, image_url, order_index)
    VALUES (?, ?, ?, ?, ?)
  `);

  const seedTransaction = db.transaction((items) => {
    for (const item of items) {
      insertStmt.run(item[0], item[1], item[2], item[3], item[4]);
    }
  });

  seedTransaction(seedCollectibles);
}

module.exports = db;
