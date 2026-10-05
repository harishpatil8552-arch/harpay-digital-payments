import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { getDatabase } from "./db";
import { createPayment, getAccount, getContacts, getNotifications, getOrCreateUser, getTransactions, lookupUpi, markAllNotificationsRead, markNotificationRead } from "./store";

const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const demoToken = process.env.DEMO_API_TOKEN ?? "harpay-demo-token";

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") ?? true }));
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await getDatabase();
    res.json({ status: "ok", service: "harpay-api", database: "mongodb", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "unavailable", service: "harpay-api", database: "mongodb" });
  }
});

app.post("/api/auth/request-otp", (req, res) => {
  const phone = String(req.body?.phone ?? "");
  if (!/^[6-9]\d{9}$/.test(phone)) {
    res.status(400).json({ error: "A valid 10-digit Indian mobile number is required" });
    return;
  }
  res.json({ requestId: "demo-request", expiresInSeconds: 300, demoOtp: "123456" });
});

app.post("/api/auth/verify-otp", async (req, res) => {
  if (req.body?.requestId !== "demo-request" || req.body?.otp !== "123456") {
    res.status(401).json({ error: "Invalid demo OTP" });
    return;
  }

  const phone = String(req.body?.phone ?? "");
  if (!/^[6-9]\d{9}$/.test(phone)) {
    res.status(400).json({ error: "A valid 10-digit Indian mobile number is required" });
    return;
  }

  const user = await getOrCreateUser({
    phone,
    name: req.body?.name ? String(req.body.name) : `User ${phone.slice(-4)}`,
    balance: Number(req.body?.balance ?? 5000),
  });

  res.json({
    token: demoToken,
    user: { id: user.id, name: user.name, phone: user.phone, upiId: user.upiId },
    balance: user.balance,
  });
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

app.get("/api/account", async (_req, res) => res.json(await getAccount()));
app.get("/api/transactions", async (_req, res) => res.json({ transactions: await getTransactions() }));
app.get("/api/notifications", async (_req, res) => res.json({ notifications: await getNotifications() }));
app.get("/api/contacts", async (_req, res) => res.json({ contacts: await getContacts() }));

app.get("/api/contacts/lookup", async (req, res) => {
  const upiId = String(req.query.upiId ?? "");
  const match = await lookupUpi(upiId);
  if (!match) {
    res.status(404).json({ error: "UPI ID not found" });
    return;
  }
  res.json({ upiId, ...match });
});

app.patch("/api/notifications/:id/read", async (req, res) => {
  if (!(await markNotificationRead(req.params.id))) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.status(204).end();
});

app.post("/api/notifications/read-all", async (_req, res) => {
  await markAllNotificationsRead();
  res.status(204).end();
});

app.post("/api/payments", async (req, res) => {
  try {
    const result = await createPayment(req.body, String(req.body?.phone ?? ""));
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to create payment" });
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Unexpected server error" });
});

getDatabase()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Harpay API listening on http://localhost:${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Unable to connect to MongoDB:", error);
    process.exitCode = 1;
  });
