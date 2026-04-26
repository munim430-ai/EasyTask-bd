import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "easy-task-bd-secret-key-2024";

// Simple JSON Database
const DB_PATH = path.join(process.cwd(), "db.json");

interface DB {
  users: any[];
  jobs: any[];
  submissions: any[];
  transactions: any[];
  messages: any[];
}

const defaultDB: DB = {
  users: [],
  jobs: [],
  submissions: [],
  transactions: [],
  messages: [],
};

function readDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return { ...defaultDB, ...parsed }; // Merge to ensure all keys exist
  } catch (e) {
    return defaultDB;
  }
}

function writeDB(data: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.use(cors());
app.use(express.json());

// --- API Routes ---
// Auth
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const db = readDB();
  if (db.users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Math.random().toString(36).substring(7),
    name,
    email,
    password: hashedPassword,
    role: role || "worker",
    balance: 0,
    rating: 5,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  writeDB(db);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
  res.json({ token, user: { id: newUser.id, name, email, role: newUser.role, balance: 0 } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email, role: user.role, balance: user.balance } });
});

// Jobs
app.get("/api/jobs", (req, res) => {
  const db = readDB();
  res.json(db.jobs.filter(j => j.status === 'active'));
});

app.post("/api/jobs", (req, res) => {
  const job = {
    id: Math.random().toString(36).substring(7),
    ...req.body,
    remaining: req.body.totalNeeded,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  const db = readDB();
  db.jobs.push(job);
  writeDB(db);
  res.json(job);
});

// Submissions
app.get("/api/submissions/:userId", (req, res) => {
  const db = readDB();
  const submissions = db.submissions.filter(s => s.userId === req.params.userId || s.employerId === req.params.userId);
  res.json(submissions);
});

app.post("/api/submissions", (req, res) => {
  const submission = {
    id: Math.random().toString(36).substring(7),
    ...req.body,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  const db = readDB();
  db.submissions.push(submission);
  writeDB(db);
  res.json(submission);
});

// Chat
app.get("/api/chat/:jobId", (req, res) => {
  const db = readDB();
  const messages = db.messages.filter(m => m.jobId === req.params.jobId);
  res.json(messages);
});

app.post("/api/chat", (req, res) => {
  const message = {
    id: Math.random().toString(36).substring(7),
    ...req.body,
    timestamp: new Date().toISOString(),
  };
  const db = readDB();
  db.messages.push(message);
  writeDB(db);
  res.json(message);
});

// Wallet / Transactions
app.get("/api/wallet/:userId", (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.userId);
  const transactions = db.transactions.filter(t => t.userId === req.params.userId);
  res.json({ balance: user?.balance || 0, transactions });
});

app.post("/api/wallet/deposit", (req, res) => {
  const { userId, amount, method, transactionId } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.balance += Number(amount);
    db.transactions.push({
      id: Math.random().toString(36).substring(7),
      userId,
      amount,
      type: "deposit",
      method,
      transactionId,
      date: new Date().toISOString(),
    });
    writeDB(db);
    res.json({ success: true, balance: user.balance });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

async function startServer() {
  // --- Vite / Static Handling ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

