export type TransactionStatus = "successful" | "failed" | "pending";
export type TransactionType = "sent" | "received" | "recharge" | "bill";
export type TransactionCategory =
  | "payment"
  | "mobile"
  | "electricity"
  | "water"
  | "dth"
  | "gas"
  | "broadband"
  | "fastag"
  | "insurance"
  | "credit_card"
  | "bank";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  recipient: string;
  recipientUpiId: string;
  sender: string;
  senderUpiId: string;
  amount: number;
  note: string;
  date: string;
  status: TransactionStatus;
}

export interface Contact {
  id: string;
  name: string;
  upiId: string;
  phone: string;
  initials: string;
  color: string;
}

export interface Notification {
  id: string;
  type: "success" | "received" | "failed" | "request";
  title: string;
  message: string;
  date: string;
  read: boolean;
  transactionId?: string;
}

export interface AppSettings {
  appLock: boolean;
  biometric: boolean;
  hideBalance: boolean;
  paymentNotifications: boolean;
  promoNotifications: boolean;
  sound: boolean;
  vibration: boolean;
  language: string;
}

export type Screen =
  | "home"
  | "scan"
  | "transactions"
  | "profile"
  | "send-money"
  | "request-money"
  | "my-qr"
  | "bills"
  | "recharge"
  | "electricity"
  | "water"
  | "dth"
  | "gas"
  | "broadband"
  | "fastag"
  | "insurance"
  | "credit-card"
  | "notifications"
  | "settings"
  | "people"
  | "analytics"
  | "transaction-detail"
  | "personal-details"
  | "bank-accounts"
  | "upi-settings"
  | "security"
  | "help"
  | "about";

export interface PaymentRecipient {
  name: string;
  upiId: string;
  verified: boolean;
}

export interface PendingPayment {
  step:
    | "recipient"
    | "amount"
    | "confirm"
    | "pin"
    | "processing"
    | "success"
    | "failed"
    | "pending";
  source: "scan" | "send" | "repeat" | "bill" | "recharge";
  recipient: PaymentRecipient | null;
  amount: string;
  note: string;
  transactionId: string;
  billType?: string;
  billProvider?: string;
}
