import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { CONTACTS, INITIAL_NOTIFICATIONS, INITIAL_TRANSACTIONS, UPI_LOOKUP } from "../src/data";

const databasePath = process.env.DATABASE_PATH ?? path.resolve(process.cwd(), "data/harpay.sqlite");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    upi_id TEXT NOT NULL UNIQUE,
    balance REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR'
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    recipient TEXT NOT NULL,
    recipient_upi_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    sender_upi_id TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    note TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL,
    status TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    transaction_id TEXT
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    upi_id TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    initials TEXT NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS upi_directory (
    upi_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 1
  );
`);

const seed = db.transaction(() => {
  const userExists = db.prepare("SELECT 1 FROM users WHERE id = ?").get("user-harish");
  if (userExists) return;

  db.prepare(
    "INSERT INTO users (id, name, phone, upi_id, balance, currency) VALUES (?, ?, ?, ?, ?, ?)",
  ).run("user-harish", "Harish Patil", "9876543210", "harish@harpay", 25450, "INR");

  const insertTransaction = db.prepare(`
    INSERT INTO transactions
      (id, type, category, recipient, recipient_upi_id, sender, sender_upi_id, amount, note, date, status)
    VALUES (@id, @type, @category, @recipient, @recipientUpiId, @sender, @senderUpiId, @amount, @note, @date, @status)
  `);
  for (const transaction of INITIAL_TRANSACTIONS) {
    insertTransaction.run(transaction);
  }

  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, type, title, message, date, read, transaction_id)
    VALUES (@id, @type, @title, @message, @date, @read, @transactionId)
  `);
  for (const notification of INITIAL_NOTIFICATIONS) {
    insertNotification.run({
      ...notification,
      read: notification.read ? 1 : 0,
      transactionId: notification.transactionId ?? null,
    });
  }

  const insertContact = db.prepare(`
    INSERT INTO contacts (id, name, upi_id, phone, initials, color)
    VALUES (@id, @name, @upiId, @phone, @initials, @color)
  `);
  for (const contact of CONTACTS) {
    insertContact.run(contact);
  }

  const insertUpi = db.prepare("INSERT INTO upi_directory (upi_id, name, verified) VALUES (?, ?, ?)");
  for (const [upiId, entry] of Object.entries(UPI_LOOKUP)) {
    insertUpi.run(upiId, entry.name, entry.verified ? 1 : 0);
  }
});

seed();
console.log(`Using SQLite database at ${databasePath}`);
