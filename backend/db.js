const { DatabaseSync } = require('node:sqlite');
require('dotenv').config();

const dbPath = process.env.DB_PATH || 'quietpaws.db';
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

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
  const insert = db.prepare(`
    INSERT INTO collectibles (type, name, detail, image_url, order_index)
    VALUES (?, ?, ?, ?, ?)
  `);

  const cats = [
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
  ];

  const pieces = [
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
    ['piece', 'Golden Bell', 'Chimes gently with the breeze', '/assets/pieces/golden_bell.png', 12],
  ];

  for (const item of [...cats, ...pieces]) {
    insert.run(...item);
  }
}

module.exports = db;
