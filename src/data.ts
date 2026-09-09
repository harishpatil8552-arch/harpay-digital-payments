import { Transaction, Contact, Notification } from "./types";

function makeDate(daysAgo: number, hour: number, min: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

export const CONTACTS: Contact[] = [
  { id: "c1", name: "Rahul Sharma", upiId: "rahul@harpay", phone: "9876543210", initials: "RS", color: "#6366f1" },
  { id: "c2", name: "Priya Sharma", upiId: "priya@harpay", phone: "9876543211", initials: "PS", color: "#ec4899" },
  { id: "c3", name: "Amit Kumar", upiId: "amit@harpay", phone: "9876543212", initials: "AK", color: "#f59e0b" },
  { id: "c4", name: "Sneha Patil", upiId: "sneha@harpay", phone: "9876543213", initials: "SP", color: "#10b981" },
  { id: "c5", name: "Rohit Deshmukh", upiId: "rohit@harpay", phone: "9876543214", initials: "RD", color: "#3b82f6" },
];

export const UPI_LOOKUP: Record<string, { name: string; verified: boolean }> = {
  "rahul@harpay": { name: "Rahul Sharma", verified: true },
  "priya@harpay": { name: "Priya Sharma", verified: true },
  "amit@harpay": { name: "Amit Kumar", verified: true },
  "sneha@harpay": { name: "Sneha Patil", verified: true },
  "rohit@harpay": { name: "Rohit Deshmukh", verified: true },
  "harish@harpay": { name: "Harish Patil", verified: true },
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "HPY20260829001", type: "sent", category: "payment",
    recipient: "Rahul Sharma", recipientUpiId: "rahul@harpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 500, note: "Lunch", date: makeDate(0, 13, 42), status: "successful",
  },
  {
    id: "HPY20260829002", type: "received", category: "payment",
    recipient: "Harish Patil", recipientUpiId: "harish@harpay",
    sender: "Priya Sharma", senderUpiId: "priya@harpay",
    amount: 2000, note: "Rent contribution", date: makeDate(0, 12, 25), status: "successful",
  },
  {
    id: "HPY20260829003", type: "bill", category: "electricity",
    recipient: "MSEB Electricity", recipientUpiId: "mseb@billpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 1250, note: "August electricity bill", date: makeDate(0, 11, 45), status: "successful",
  },
  {
    id: "HPY20260829004", type: "sent", category: "payment",
    recipient: "Amit Kumar", recipientUpiId: "amit@harpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 750, note: "Movie tickets", date: makeDate(0, 10, 30), status: "successful",
  },
  {
    id: "HPY20260829005", type: "recharge", category: "mobile",
    recipient: "Jio Mobile", recipientUpiId: "jio@recharge",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 299, note: "Monthly plan", date: makeDate(0, 9, 15), status: "successful",
  },
  {
    id: "HPY20260829006", type: "received", category: "payment",
    recipient: "Harish Patil", recipientUpiId: "harish@harpay",
    sender: "Sneha Patil", senderUpiId: "sneha@harpay",
    amount: 1500, note: "Birthday gift", date: makeDate(0, 8, 0), status: "successful",
  },
  {
    id: "HPY20260829007", type: "bill", category: "water",
    recipient: "Pune Municipal Water", recipientUpiId: "pmcwater@billpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 350, note: "Water bill", date: makeDate(0, 7, 30), status: "failed",
  },
  {
    id: "HPY20260828001", type: "sent", category: "payment",
    recipient: "Rohit Deshmukh", recipientUpiId: "rohit@harpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 1000, note: "Dinner", date: makeDate(1, 20, 15), status: "successful",
  },
  {
    id: "HPY20260828002", type: "bill", category: "dth",
    recipient: "Tata Sky DTH", recipientUpiId: "tatasky@billpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 450, note: "Monthly subscription", date: makeDate(1, 18, 0), status: "successful",
  },
  {
    id: "HPY20260828003", type: "received", category: "payment",
    recipient: "Harish Patil", recipientUpiId: "harish@harpay",
    sender: "Rahul Sharma", senderUpiId: "rahul@harpay",
    amount: 3000, note: "Project payment", date: makeDate(1, 15, 30), status: "successful",
  },
  {
    id: "HPY20260828004", type: "sent", category: "payment",
    recipient: "Priya Sharma", recipientUpiId: "priya@harpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 600, note: "Grocery split", date: makeDate(1, 12, 0), status: "successful",
  },
  {
    id: "HPY20260827001", type: "recharge", category: "mobile",
    recipient: "Airtel Mobile", recipientUpiId: "airtel@recharge",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 399, note: "Data plan", date: makeDate(2, 16, 45), status: "successful",
  },
  {
    id: "HPY20260827002", type: "bill", category: "gas",
    recipient: "MGL Gas", recipientUpiId: "mgl@billpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 800, note: "Monthly gas bill", date: makeDate(2, 14, 20), status: "successful",
  },
  {
    id: "HPY20260827003", type: "sent", category: "payment",
    recipient: "Amit Kumar", recipientUpiId: "amit@harpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 2500, note: "Half yearly savings", date: makeDate(2, 11, 0), status: "pending",
  },
  {
    id: "HPY20260826001", type: "received", category: "payment",
    recipient: "Harish Patil", recipientUpiId: "harish@harpay",
    sender: "Sneha Patil", senderUpiId: "sneha@harpay",
    amount: 500, note: "Shared lunch", date: makeDate(3, 13, 30), status: "successful",
  },
  {
    id: "HPY20260826002", type: "bill", category: "broadband",
    recipient: "ACT Broadband", recipientUpiId: "act@billpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 999, note: "Monthly broadband plan", date: makeDate(3, 10, 0), status: "successful",
  },
  {
    id: "HPY20260825001", type: "sent", category: "payment",
    recipient: "Rohit Deshmukh", recipientUpiId: "rohit@harpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 1800, note: "Office supplies", date: makeDate(4, 15, 30), status: "successful",
  },
  {
    id: "HPY20260825002", type: "bill", category: "fastag",
    recipient: "FASTag NHAI", recipientUpiId: "nhai@fastag",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 500, note: "Toll recharge", date: makeDate(4, 9, 45), status: "successful",
  },
  {
    id: "HPY20260824001", type: "received", category: "payment",
    recipient: "Harish Patil", recipientUpiId: "harish@harpay",
    sender: "Rahul Sharma", senderUpiId: "rahul@harpay",
    amount: 5000, note: "Freelance payment", date: makeDate(5, 17, 0), status: "successful",
  },
  {
    id: "HPY20260824002", type: "bill", category: "insurance",
    recipient: "LIC Insurance", recipientUpiId: "lic@billpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 3200, note: "Monthly premium", date: makeDate(5, 11, 0), status: "successful",
  },
  {
    id: "HPY20260823001", type: "sent", category: "payment",
    recipient: "Priya Sharma", recipientUpiId: "priya@harpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 850, note: "Shopping", date: makeDate(6, 14, 15), status: "successful",
  },
  {
    id: "HPY20260823002", type: "bill", category: "credit_card",
    recipient: "HDFC Credit Card", recipientUpiId: "hdfc@billpay",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 8500, note: "Monthly credit card bill", date: makeDate(6, 10, 30), status: "successful",
  },
  {
    id: "HPY20260822001", type: "received", category: "payment",
    recipient: "Harish Patil", recipientUpiId: "harish@harpay",
    sender: "Amit Kumar", senderUpiId: "amit@harpay",
    amount: 2200, note: "Team outing contribution", date: makeDate(7, 16, 0), status: "successful",
  },
  {
    id: "HPY20260821001", type: "sent", category: "bank",
    recipient: "Savings Account", recipientUpiId: "icici@bank",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 10000, note: "Monthly savings", date: makeDate(8, 9, 0), status: "successful",
  },
  {
    id: "HPY20260820001", type: "recharge", category: "mobile",
    recipient: "Vi Mobile", recipientUpiId: "vi@recharge",
    sender: "Harish Patil", senderUpiId: "harish@harpay",
    amount: 199, note: "Basic plan", date: makeDate(9, 11, 30), status: "successful",
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "success", read: false,
    title: "Payment Successful", message: "₹500 paid to Rahul Sharma",
    date: makeDate(0, 13, 42), transactionId: "HPY20260829001",
  },
  {
    id: "n2", type: "received", read: false,
    title: "Money Received", message: "₹2,000 received from Priya Sharma",
    date: makeDate(0, 12, 25), transactionId: "HPY20260829002",
  },
  {
    id: "n3", type: "failed", read: false,
    title: "Payment Failed", message: "Water bill payment failed",
    date: makeDate(0, 7, 30), transactionId: "HPY20260829007",
  },
  {
    id: "n4", type: "request", read: true,
    title: "Payment Request", message: "Rahul Sharma requested ₹500",
    date: makeDate(1, 15, 0),
  },
  {
    id: "n5", type: "received", read: true,
    title: "Money Received", message: "₹3,000 received from Rahul Sharma",
    date: makeDate(1, 15, 30), transactionId: "HPY20260828003",
  },
];

export const PLANS: Record<string, Array<{ id: string; validity: string; data: string; price: number; desc: string }>> = {
  Jio: [
    { id: "j1", validity: "28 days", data: "1.5GB/day", price: 199, desc: "Unlimited calls + SMS" },
    { id: "j2", validity: "56 days", data: "1.5GB/day", price: 299, desc: "Unlimited calls + SMS" },
    { id: "j3", validity: "84 days", data: "2GB/day", price: 399, desc: "Unlimited calls + data" },
    { id: "j4", validity: "365 days", data: "24GB total", price: 2999, desc: "Annual plan" },
  ],
  Airtel: [
    { id: "a1", validity: "28 days", data: "1.5GB/day", price: 199, desc: "Unlimited calls" },
    { id: "a2", validity: "56 days", data: "2GB/day", price: 299, desc: "100 SMS/day" },
    { id: "a3", validity: "84 days", data: "2GB/day", price: 399, desc: "Unlimited calls + data" },
    { id: "a4", validity: "365 days", data: "24GB total", price: 2999, desc: "Annual plan" },
  ],
  Vi: [
    { id: "v1", validity: "28 days", data: "1.5GB/day", price: 199, desc: "Unlimited calls" },
    { id: "v2", validity: "56 days", data: "1.5GB/day", price: 299, desc: "Unlimited calls" },
    { id: "v3", validity: "84 days", data: "2GB/day", price: 399, desc: "Data rollover" },
    { id: "v4", validity: "365 days", data: "24GB total", price: 2999, desc: "Annual plan" },
  ],
  BSNL: [
    { id: "b1", validity: "28 days", data: "2GB/day", price: 107, desc: "Low cost plan" },
    { id: "b2", validity: "30 days", data: "3GB/day", price: 197, desc: "Unlimited calls" },
    { id: "b3", validity: "60 days", data: "3GB/day", price: 247, desc: "Unlimited calls" },
    { id: "b4", validity: "365 days", data: "600GB total", price: 1999, desc: "Annual plan" },
  ],
};
