const db = require("../db");

async function getFullRewardsCatalog(userId) {
  const res = await db.query(
    `
    SELECT 
      c.id,
      c.type,
      c.name,
      c.detail,
      c.image_url,
      c.order_index,
      CASE WHEN uc.id IS NOT NULL THEN 1 ELSE 0 END as unlocked,
      uc.unlocked_at as "unlockedAt"
    FROM collectibles c
    LEFT JOIN user_collectibles uc ON c.id = uc.collectible_id AND uc.user_id = $1
    ORDER BY c.type ASC, c.order_index ASC
  `,
    [userId]
  );

  const cats = [];
  const pieces = [];
  let totalItems = 0;
  let totalUnlocked = 0;

  for (const row of res.rows) {
    totalItems++;
    const isUnlocked = Boolean(Number(row.unlocked));
    if (isUnlocked) totalUnlocked++;

    const item = {
      id: row.id,
      name: row.name,
      detail: row.detail,
      image_url: row.image_url,
      order_index: row.order_index,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? row.unlockedAt : null,
    };

    if (row.type === "cat") {
      cats.push(item);
    } else if (row.type === "piece") {
      pieces.push(item);
    }
  }

  const houseComplete = totalItems > 0 && totalUnlocked === totalItems;

  return {
    cats,
    pieces,
    houseComplete,
  };
}

async function unlockNextCollectible(userId, preferredType) {
  // 1. Preferred pool query
  const res1 = await db.query(
    `
    SELECT c.id, c.type, c.name, c.detail, c.image_url, c.order_index
    FROM collectibles c
    WHERE c.type = $1
      AND c.id NOT IN (SELECT collectible_id FROM user_collectibles WHERE user_id = $2)
    ORDER BY c.order_index ASC
    LIMIT 1
  `,
    [preferredType, userId]
  );

  let nextItem = res1.rows[0] || null;

  // 2. Fallback pool query if preferred pool is complete
  if (!nextItem) {
    const altType = preferredType === "cat" ? "piece" : "cat";
    const res2 = await db.query(
      `
      SELECT c.id, c.type, c.name, c.detail, c.image_url, c.order_index
      FROM collectibles c
      WHERE c.type = $1
        AND c.id NOT IN (SELECT collectible_id FROM user_collectibles WHERE user_id = $2)
      ORDER BY c.order_index ASC
      LIMIT 1
    `,
      [altType, userId]
    );
    nextItem = res2.rows[0] || null;
  }

  if (!nextItem) {
    return null;
  }

  const unlockedAt = new Date().toISOString();
  await db.query(
    `
    INSERT INTO user_collectibles (user_id, collectible_id, unlocked_at)
    VALUES ($1, $2, $3)
  `,
    [userId, nextItem.id, unlockedAt]
  );

  return {
    id: nextItem.id,
    type: nextItem.type,
    name: nextItem.name,
    detail: nextItem.detail,
    image_url: nextItem.image_url,
  };
}

module.exports = {
  getFullRewardsCatalog,
  unlockNextCollectible,
};
