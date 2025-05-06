import * as SQLite from 'expo-sqlite';

const openDatabase = async () => {
  return await SQLite.openDatabaseAsync('mydatabase.db');
};

export const createTable = async () => {
  const db = await openDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL
    );
  `);
};

export const insertUser = async (name, phone) => {
  const db = await openDatabase();
  const result = await db.runAsync(
    'INSERT INTO users (name, phone) VALUES (?, ?)',
    name, phone
  );
  return result.lastInsertRowId;
};

export const fetchUsers = async () => {
  const db = await openDatabase();
  return await db.getAllAsync('SELECT * FROM users');
};

export const updateUser = async (name, phone, id) => {
  const db = await openDatabase();
  await db.runAsync(
    'UPDATE users SET name = ?, phone = ? WHERE id = ?',
    name, phone, id
  );
};

export const deleteUser = async (id) => {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM users WHERE id = ?', id);
};