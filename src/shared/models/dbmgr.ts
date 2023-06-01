import sqlite from 'sqlite3'
export const db = new sqlite.Database('./database.db')
