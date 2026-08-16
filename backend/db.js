const { Pool } = require("pg");
require("dotenv").config();

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_Oxnoj2lHMD9g@ep-orange-lake-axh2hpem-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        current_streak INT NOT NULL DEFAULT 0,
        best_streak INT NOT NULL DEFAULT 0,
        last_completed_day VARCHAR(50),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collectibles (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL CHECK(type IN ('cat', 'piece')),
        name VARCHAR(255) NOT NULL,
        detail TEXT,
        image_url VARCHAR(500) NOT NULL,
        order_index INT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_collectibles (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        collectible_id INT NOT NULL REFERENCES collectibles(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        duration_min INT NOT NULL,
        intention TEXT,
        completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reward_type VARCHAR(50),
        reward_id INT
      );
    `);

    const countRes = await pool.query("SELECT COUNT(*)::int as count FROM collectibles");
    if (countRes.rows[0].count === 0) {
      const collectiblesData = [
        ["cat", "Mochi", "Naps in sunbeams, ignores everyone", "/assets/cats/mochi.png", 1],
        ["cat", "Biscuit", "Judges your life choices silently", "/assets/cats/biscuit.png", 2],
        ["cat", "Luna", "Watches the night sky with curiosity", "/assets/cats/luna.png", 3],
        ["cat", "Oliver", "Always ready for a gentle purr", "/assets/cats/oliver.png", 4],
        ["cat", "Cleo", "Sits like royalty on cozy cushions", "/assets/cats/cleo.png", 5],
        ["cat", "Simba", "Brave little explorer of quiet corners", "/assets/cats/simba.png", 6],
        ["cat", "Peanut", "Small, playful, and loves cardboards", "/assets/cats/peanut.png", 7],
        ["piece", "Cozy Bed", "A warm little nook for napping", "/assets/home/main-home/Bed.png", 1],
        ["piece", "Soft Carpet", "Warms up the floor underfoot", "/assets/home/main-home/Carpet.png", 2],
        ["piece", "Cat Scratcher", "Keeps claws happy and furniture safe", "/assets/home/main-home/Cat-scratcher.png", 3],
        ["piece", "Wooden Shelves", "Filled with peaceful little things", "/assets/home/main-home/shelves.png", 4],
        ["piece", "Wall Decor", "A gentle finishing touch for the room", "/assets/home/main-home/Wall-decor.png", 5],
      ];

      for (const item of collectiblesData) {
        await pool.query(
          `INSERT INTO collectibles (type, name, detail, image_url, order_index) VALUES ($1, $2, $3, $4, $5)`,
          item
        );
      }
      console.log("Database initialized and collectibles seeded successfully.");
    }
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

const dbInitPromise = initDb();

module.exports = {
  query: async (text, params) => {
    await dbInitPromise;
    return pool.query(text, params);
  },
  pool,
  dbInitPromise
};
