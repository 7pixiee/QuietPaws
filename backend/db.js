const { DatabaseSync } = require("node:sqlite");
require("dotenv").config();

const dbPath = process.env.DB_PATH || "quietpaws.db";
const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

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
const countRow = db.prepare("SELECT COUNT(*) as count FROM collectibles").get();

if (countRow.count === 0) {
  const insert = db.prepare(`
    INSERT INTO collectibles (type, name, detail, image_url, order_index)
    VALUES (?, ?, ?, ?, ?)
  `);

  const cats = [
    [
      "cat",
      "Mochi",
      "Naps in sunbeams, ignores everyone",
      "/assets/cats/mochi.png",
      1,
    ],
    [
      "cat",
      "Biscuit",
      "Judges your life choices silently",
      "/assets/cats/biscuit.png",
      2,
    ],
    [
      "cat",
      "Luna",
      "Watches the night sky with curiosity",
      "/assets/cats/luna.png",
      3,
    ],
    [
      "cat",
      "Oliver",
      "Always ready for a gentle purr",
      "/assets/cats/oliver.png",
      4,
    ],
    [
      "cat",
      "Cleo",
      "Sits like royalty on cozy cushions",
      "/assets/cats/cleo.png",
      5,
    ],
    [
      "cat",
      "Simba",
      "Brave little explorer of quiet corners",
      "/assets/cats/simba.png",
      6,
    ],
    [
      "cat",
      "Peanut",
      "Small, playful, and loves cardboards",
      "/assets/cats/peanut.png",
      7,
    ],
  ];

  const pieces = [
    [
      "piece",
      "Cozy Bed",
      "A warm little nook for napping",
      "/assets/home/main-home/Bed.png",
      1,
    ],
    [
      "piece",
      "Soft Carpet",
      "Warms up the floor underfoot",
      "/assets/home/main-home/Carpet.png",
      2,
    ],
    [
      "piece",
      "Cat Scratcher",
      "Keeps claws happy and furniture safe",
      "/assets/home/main-home/Cat-scratcher.png",
      3,
    ],
    [
      "piece",
      "Wooden Shelves",
      "Filled with peaceful little things",
      "/assets/home/main-home/shelves.png",
      4,
    ],
    [
      "piece",
      "Wall Decor",
      "A gentle finishing touch for the room",
      "/assets/home/main-home/Wall-decor.png",
      5,
    ],
  ];

  for (const item of [...cats, ...pieces]) {
    insert.run(...item);
  }
}

module.exports = db;
