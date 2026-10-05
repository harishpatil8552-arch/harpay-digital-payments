import "dotenv/config";
import { MongoClient, type Collection, type Db } from "mongodb";
import { CONTACTS, INITIAL_NOTIFICATIONS, INITIAL_TRANSACTIONS, UPI_LOOKUP } from "../src/data";
import type { Contact, Notification, Transaction } from "../src/types";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is required. Set it in your environment or .env file.");
}

const client = new MongoClient(mongoUri);
let connection: Promise<Db> | undefined;

export type UserDocument = {
  id: string;
  name: string;
  phone: string;
  upiId: string;
  balance: number;
  currency: string;
};

export type TransactionDocument = Transaction;
export type NotificationDocument = Notification;
export type ContactDocument = Contact;
export type UpiDocument = { upiId: string; name: string; verified: boolean };

export async function getDatabase(): Promise<Db> {
  if (!connection) {
    connection = client.connect().then(async () => {
      const database = client.db(process.env.MONGODB_DATABASE ?? "harpay");
      await initializeDatabase(database);
      console.log(`Connected to MongoDB database ${database.databaseName}`);
      return database;
    }).catch((error: unknown) => {
      connection = undefined;
      throw error;
    });
  }
  return connection;
}

export async function getCollection<T extends object>(name: string): Promise<Collection<T>> {
  return (await getDatabase()).collection<T>(name);
}

async function initializeDatabase(database: Db) {
  const users = database.collection<UserDocument>("users");
  const transactions = database.collection<TransactionDocument>("transactions");
  const notifications = database.collection<NotificationDocument>("notifications");
  const contacts = database.collection<ContactDocument>("contacts");
  const upiDirectory = database.collection<UpiDocument>("upi_directory");

  await Promise.all([
    users.createIndex({ phone: 1 }, { unique: true }),
    users.createIndex({ upiId: 1 }, { unique: true }),
    transactions.createIndex({ date: -1 }),
    notifications.createIndex({ date: -1 }),
    contacts.createIndex({ upiId: 1 }, { unique: true }),
  ]);

  if ((await transactions.countDocuments()) === 0) {
    await transactions.insertMany(INITIAL_TRANSACTIONS);
  }
  if ((await notifications.countDocuments()) === 0) {
    await notifications.insertMany(INITIAL_NOTIFICATIONS);
  }
  if ((await contacts.countDocuments()) === 0) {
    await contacts.insertMany(CONTACTS);
  }
  if ((await upiDirectory.countDocuments()) === 0) {
    await upiDirectory.insertMany(
      Object.entries(UPI_LOOKUP).map(([upiId, entry]) => ({
        upiId,
        name: entry.name,
        verified: entry.verified,
      })),
    );
  }
}
