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

const userId = "user-harish";

async function accountRow() {
  const user = await (await getCollection<UserDocument>("users")).findOne({ id: userId });
  if (!user) throw new Error("Account not found");
  return user;
}

function transactionId() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `HPY${stamp}${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;
}

export async function getUser() {
  const account = await accountRow();
  return { id: account.id, name: account.name, phone: account.phone, upiId: account.upiId };
}

export async function getAccount() {
  const account = await accountRow();
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

export async function createPayment(input: PaymentInput) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

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
    sender: (await getUser()).name,
    senderUpiId: (await getUser()).upiId,
    amount: input.amount,
    note: input.note ?? "",
    date: now,
    status: "successful",
  };

  const debit = await users.updateOne(
    { id: userId, balance: { $gte: input.amount } },
    { $inc: { balance: -input.amount } },
  );
  if (debit.modifiedCount === 0) {
    const account = await accountRow();
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
    await users.updateOne({ id: userId }, { $inc: { balance: input.amount } });
    await transactions.deleteOne({ id: transaction.id });
    throw error;
  }

  return { transaction, account: await getAccount() };
}
