import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function initDb() {
  db = await open({
    filename: './funds.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS funds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      category TEXT,
      description TEXT,
      data TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('數據庫初始化完成');
}

export function getDb() {
  return db;
}
