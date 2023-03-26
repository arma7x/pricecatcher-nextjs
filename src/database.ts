import path from 'path';
const sqlite3 = require("sqlite3").verbose();

const databaseInstance = new sqlite3.Database(path.join(process.cwd(), "pricecatcher.db"));

export {
  databaseInstance,
}
