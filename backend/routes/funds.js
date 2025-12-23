import { getDb } from '../db.js';

export async function saveFunds(funds) {
  const db = getDb();
  
  for (const fund of funds) {
    await db.run(
      `INSERT OR REPLACE INTO funds (id, name, code, category, description, data, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [fund.id, fund.name, fund.code, fund.category, fund.description, fund.data]
    );
  }
}

export async function getFunds() {
  const db = getDb();
  return await db.all('SELECT * FROM funds ORDER BY createdAt DESC');
}

export async function deleteFund(id) {
  const db = getDb();
  await db.run('DELETE FROM funds WHERE id = ?', [id]);
}
