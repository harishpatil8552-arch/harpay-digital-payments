import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { createPayment, getAccount, getContacts, getNotifications, getTransactions, lookupUpi, markAllNotificationsRead, markNotificationRead } from "./store";

const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const demoToken = process.env.DEMO_API_TOKEN ?? "harpay-demo-token";

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") ?? true }));
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "harpay-api", timestamp: new Date().toISOString() });
});

app.post("/api/auth/request-otp", (req, res) => {
  const phone = String(req.body?.phone ?? "");
  if (!/^[6-9]\d{9}$/.test(phone)) {
    res.status(400).json({ error: "A valid 10-digit Indian mobile number is required" });
    return;
  }
  res.json({ requestId: "demo-request", expiresInSeconds: 300, demoOtp: "123456" });
});

app.post("/api/auth/verify-otp", (req, res) => {
  if (req.body?.requestId !== "demo-request" || req.body?.otp !== "123456") {
    res.status(401).json({ error: "Invalid demo OTP" });
    return;
  }
  res.json({ token: demoToken, user: getAccount().user });
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.headers.authorization !== `Bearer ${demoToken}`) {
    res.status(401).json({ error: "A valid bearer token is required" });
    return;
  }
  next();
}

app.use("/api/account", requireAuth);
app.use("/api/transactions", requireAuth);
app.use("/api/notifications", requireAuth);
app.use("/api/contacts", requireAuth);
app.use("/api/payments", requireAuth);

app.get("/api/account", (_req, res) => res.json(getAccount()));
app.get("/api/transactions", (_req, res) => res.json({ transactions: getTransactions() }));
app.get("/api/notifications", (_req, res) => res.json({ notifications: getNotifications() }));
app.get("/api/contacts", (_req, res) => res.json({ contacts: getContacts() }));

app.get("/api/contacts/lookup", (req, res) => {
  const upiId = String(req.query.upiId ?? "");
  const match = lookupUpi(upiId);
  if (!match) {
    res.status(404).json({ error: "UPI ID not found" });
    return;
  }
  res.json({ upiId, ...match });
});

app.patch("/api/notifications/:id/read", (req, res) => {
  if (!markNotificationRead(req.params.id)) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.status(204).end();
});

app.post("/api/notifications/read-all", (_req, res) => {
  markAllNotificationsRead();
  res.status(204).end();
});

app.post("/api/payments", (req, res) => {
  try {
    const result = createPayment(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to create payment" });
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Unexpected server error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Harpay API listening on http://localhost:${port}`);
});
