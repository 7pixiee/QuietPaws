const db = require('../db');

function getFullRewardsCatalog(userId) {
  const rows = db.prepare(`
    SELECT 
      c.id,
      c.type,
      c.name,
      c.detail,
      c.image_url,
      c.order_index,
      CASE WHEN uc.id IS NOT NULL THEN 1 ELSE 0 END as unlocked,
      uc.unlocked_at as unlockedAt
    FROM collectibles c
    LEFT JOIN user_collectibles uc ON c.id = uc.collectible_id AND uc.user_id = ?
    ORDER BY c.type ASC, c.order_index ASC
  `).all(userId);

  const cats = [];
  const pieces = [];
  let totalItems = 0;
  let totalUnlocked = 0;

  for (const row of rows) {
    totalItems++;
    const isUnlocked = Boolean(row.unlocked);
    if (isUnlocked) totalUnlocked++;

    const item = {
      name: row.name,
      detail: row.detail,
      image_url: row.image_url,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? row.unlockedAt : null
    };

    if (row.type === 'cat') {
      cats.push(item);
    } else if (row.type === 'piece') {
      pieces.push(item);
    }
  }

  const houseComplete = totalItems > 0 && totalUnlocked === totalItems;

  return {
    cats,
    pieces,
    houseComplete
  };
}

function unlockNextCollectible(userId, preferredType) {
  // 1. Preferred pool query
  let nextItem = db.prepare(`
    SELECT c.id, c.type, c.name, c.detail, c.image_url, c.order_index
    FROM collectibles c
    WHERE c.type = ?
      AND c.id NOT IN (SELECT collectible_id FROM user_collectibles WHERE user_id = ?)
    ORDER BY c.order_index ASC
    LIMIT 1
  `).get(preferredType, userId);

  // 2. Fallback pool query if preferred pool is complete
  if (!nextItem) {
    const altType = preferredType === 'cat' ? 'piece' : 'cat';
    nextItem = db.prepare(`
      SELECT c.id, c.type, c.name, c.detail, c.image_url, c.order_index
      FROM collectibles c
      WHERE c.type = ?
        AND c.id NOT IN (SELECT collectible_id FROM user_collectibles WHERE user_id = ?)
      ORDER BY c.order_index ASC
      LIMIT 1
    `).get(altType, userId);
  }

  if (!nextItem) {
    return null;
  }

  const unlockedAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO user_collectibles (user_id, collectible_id, unlocked_at)
    VALUES (?, ?, ?)
  `).run(userId, nextItem.id, unlockedAt);

  return {
    id: nextItem.id,
    type: nextItem.type,
    name: nextItem.name,
    detail: nextItem.detail,
    image_url: nextItem.image_url
  };
}

module.exports = {
  getFullRewardsCatalog,
  unlockNextCollectible
};
