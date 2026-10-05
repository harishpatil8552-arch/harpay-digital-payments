import { randomUUID } from "node:crypto";
import { getCollection, type ContactDocument, type NotificationDocument, type TransactionDocument, type UserDocument } from "./db";
import type { Contact, Notification, Transaction, TransactionCategory, TransactionType } from "../src/types";

export type PaymentInput = {
  type?: TransactionType;
  category?: TransactionCategory;
  recipient: string;
  recipientUpiId: string;
  amount: number;
  note?: string;
};

async function accountRow(phone?: string) {
  const users = await getCollection<UserDocument>("users");
  const user = phone ? await users.findOne({ phone }) : await users.findOne({});
  if (!user) throw new Error("Account not found");
  return user;
}

export async function getOrCreateUser(input: { phone: string; name?: string; upiId?: string; balance?: number; currency?: string }) {
  const users = await getCollection<UserDocument>("users");
  const phone = String(input.phone).replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("A valid 10-digit Indian mobile number is required");
  }

  const existing = await users.findOne({ phone });
  if (existing) return existing;

  const baseName = (input.name ?? `User ${phone.slice(-4)}`).trim() || `User ${phone.slice(-4)}`;
  const baseUpi = (input.upiId ?? `${baseName.toLowerCase().replace(/[^a-z0-9]/g, "") || `user${phone.slice(-4)}`}@harpay`).toLowerCase();
  let upiId = baseUpi;
  let suffix = 1;
  while (await users.findOne({ upiId })) {
    upiId = `${baseUpi.split("@")[0]}${suffix}@harpay`;
    suffix += 1;
  }

  const user: UserDocument = {
    id: `user-${Math.random().toString(36).slice(2, 10)}`,
    name: baseName,
    phone,
    upiId,
    balance: input.balance ?? 5000,
    currency: input.currency ?? "INR",
  };

  await users.insertOne(user);
  return user;
}

function transactionId() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `HPY${stamp}${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;
}

export async function getUser(phone?: string) {
  const account = await accountRow(phone);
  return { id: account.id, name: account.name, phone: account.phone, upiId: account.upiId };
}

export async function getAccount(phone?: string) {
  const account = await accountRow(phone);
  return {
    user: { id: account.id, name: account.name, phone: account.phone, upiId: account.upiId },
    balance: account.balance,
    currency: account.currency,
  };
}

export async function getTransactions(): Promise<Transaction[]> {
  return (await getCollection<TransactionDocument>("transactions"))
    .find({}, { projection: { _id: 0 } })
    .sort({ date: -1 })
    .toArray();
}

export async function getNotifications(): Promise<Notification[]> {
  return (await getCollection<NotificationDocument>("notifications"))
    .find({}, { projection: { _id: 0 } })
    .sort({ date: -1 })
    .toArray();
}

export async function getContacts(): Promise<Contact[]> {
  return (await getCollection<ContactDocument>("contacts"))
    .find({}, { projection: { _id: 0 } })
    .sort({ name: 1 })
    .toArray();
}

export async function lookupUpi(upiId: string) {
  const match = await (await getCollection<{ upiId: string; name: string; verified: boolean }>("upi_directory"))
    .findOne({ upiId }, { projection: { _id: 0, name: 1, verified: 1 } });
  return match ? { name: match.name, verified: match.verified } : null;
}

export async function markNotificationRead(id: string) {
  const result = await (await getCollection<NotificationDocument>("notifications"))
    .updateOne({ id }, { $set: { read: true } });
  return result.matchedCount > 0;
}

export async function markAllNotificationsRead() {
  await (await getCollection<NotificationDocument>("notifications"))
    .updateMany({ read: false }, { $set: { read: true } });
}

export async function createPayment(input: PaymentInput, phone?: string) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const account = await accountRow(phone);
  const users = await getCollection<UserDocument>("users");
  const transactions = await getCollection<TransactionDocument>("transactions");
  const notifications = await getCollection<NotificationDocument>("notifications");
  const now = new Date().toISOString();
  const transaction: Transaction = {
    id: transactionId(),
    type: input.type ?? "sent",
    category: input.category ?? "payment",
    recipient: input.recipient,
    recipientUpiId: input.recipientUpiId,
    sender: account.name,
    senderUpiId: account.upiId,
    amount: input.amount,
    note: input.note ?? "",
    date: now,
    status: "successful",
  };

  const debit = await users.updateOne(
    { id: account.id, balance: { $gte: input.amount } },
    { $inc: { balance: -input.amount } },
  );
  if (debit.modifiedCount === 0) {
    if (input.amount > account.balance) throw new Error("Insufficient balance");
    throw new Error("Unable to update account balance");
  }

  try {
    await transactions.insertOne(transaction);
    await notifications.insertOne({
      id: randomUUID(),
      type: "success",
      title: "Payment Successful",
      message: `₹${input.amount.toLocaleString()} paid to ${input.recipient}`,
      date: now,
      read: false,
      transactionId: transaction.id,
    });
  } catch (error) {
    await users.updateOne({ id: account.id }, { $inc: { balance: input.amount } });
    await transactions.deleteOne({ id: transaction.id });
    throw error;
  }

  return { transaction, account: await getAccount(account.phone) };
}
