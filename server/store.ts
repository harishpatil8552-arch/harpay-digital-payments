import { randomUUID } from "node:crypto";
import { db } from "./db";
import type { Contact, Notification, Transaction, TransactionCategory, TransactionType } from "../src/types";

export type PaymentInput = {
  type?: TransactionType;
  category?: TransactionCategory;
  recipient: string;
  recipientUpiId: string;
  amount: number;
  note?: string;
};

type AccountRow = {
  id: string;
  name: string;
  phone: string;
  upiId: string;
  balance: number;
  currency: string;
};

type TransactionRow = Omit<Transaction, "recipientUpiId" | "senderUpiId"> & {
  recipient_upi_id: string;
  sender_upi_id: string;
};

type NotificationRow = Omit<Notification, "read" | "transactionId"> & {
  read: number;
  transaction_id: string | null;
};

function accountRow(): AccountRow {
  return db.prepare(`
    SELECT id, name, phone, upi_id AS upiId, balance, currency
    FROM users WHERE id = ?
  `).get("user-harish") as AccountRow;
}

function transactionId() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `HPY${stamp}${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;
}

export function getUser() {
  const account = accountRow();
  return {
    id: account.id,
    name: account.name,
    phone: account.phone,
    upiId: account.upiId,
  };
}

export function getAccount() {
  const account = accountRow();
  return {
    user: getUser(),
    balance: account.balance,
    currency: account.currency,
  };
}

export function getTransactions() {
  const rows = db.prepare(`
    SELECT id, type, category, recipient, recipient_upi_id, sender, sender_upi_id,
      amount, note, date, status
    FROM transactions ORDER BY date DESC
  `).all() as TransactionRow[];
  return rows.map(({ recipient_upi_id, sender_upi_id, ...transaction }) => ({
    ...transaction,
    recipientUpiId: recipient_upi_id,
    senderUpiId: sender_upi_id,
  }));
}

export function getNotifications() {
  const rows = db.prepare(`
    SELECT id, type, title, message, date, read, transaction_id
    FROM notifications ORDER BY date DESC
  `).all() as NotificationRow[];
  return rows.map(({ read, transaction_id, ...notification }) => ({
    ...notification,
    read: Boolean(read),
    ...(transaction_id ? { transactionId: transaction_id } : {}),
  }));
}

export function getContacts(): Contact[] {
  return db.prepare(`
    SELECT id, name, upi_id AS upiId, phone, initials, color
    FROM contacts ORDER BY name
  `).all() as Contact[];
}

export function lookupUpi(upiId: string) {
  const match = db.prepare(`
    SELECT name, verified
    FROM upi_directory WHERE upi_id = ?
  `).get(upiId) as { name: string; verified: number } | undefined;
  return match ? { name: match.name, verified: Boolean(match.verified) } : null;
}

export function markNotificationRead(id: string) {
  const result = db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(id);
  return result.changes > 0;
}

export function markAllNotificationsRead() {
  db.prepare("UPDATE notifications SET read = 1 WHERE read = 0").run();
}

export function createPayment(input: PaymentInput) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  if (input.amount > getAccount().balance) {
    throw new Error("Insufficient balance");
  }

  const createPayment = db.transaction(() => {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      id: transactionId(),
      type: input.type ?? "sent",
      category: input.category ?? "payment",
      recipient: input.recipient,
      recipientUpiId: input.recipientUpiId,
      sender: getUser().name,
      senderUpiId: getUser().upiId,
      amount: input.amount,
      note: input.note ?? "",
      date: now,
      status: "successful",
    };

    db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(input.amount, "user-harish");
    db.prepare(`
      INSERT INTO transactions
        (id, type, category, recipient, recipient_upi_id, sender, sender_upi_id, amount, note, date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      transaction.id,
      transaction.type,
      transaction.category,
      transaction.recipient,
      transaction.recipientUpiId,
      transaction.sender,
      transaction.senderUpiId,
      transaction.amount,
      transaction.note,
      transaction.date,
      transaction.status,
    );
    db.prepare(`
      INSERT INTO notifications (id, type, title, message, date, read, transaction_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      "success",
      "Payment Successful",
      `₹${input.amount.toLocaleString()} paid to ${input.recipient}`,
      now,
      0,
      transaction.id,
    );

    return { transaction, account: getAccount() };
  });

  return createPayment();
}
