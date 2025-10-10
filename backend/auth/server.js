// cat > server.js <<'JS'
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

// super simple in-memory store for demo
const USERS = new Map(); // email -> { id, email, name }
const SECRET = "evania-demo-secret";

// Health
app.get("/health", (_req,res)=>res.json({ok:true}));

// POST /auth/signup {email, password, name}
app.post("/auth/signup", (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email & password required" });
  if (USERS.has(email)) return res.status(409).json({ error: "email already registered" });
  const user = { id: uuidv4(), email, name: name || email.split("@")[0] };
  USERS.set(email, user);
  const token = jwt.sign({ sub: user.id, email }, SECRET, { expiresIn: "2h" });
  res.json({ user, token });
});

// POST /auth/login {email, password}
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email & password required" });
  // demo: accept any password if user exists, else auto-create
  let user = USERS.get(email);
  if (!user) {
    user = { id: uuidv4(), email, name: email.split("@")[0] };
    USERS.set(email, user);
  }
  const token = jwt.sign({ sub: user.id, email }, SECRET, { expiresIn: "2h" });
  res.json({ user, token });
});

// GET /onboarding/start  -> questionnaire
app.get("/onboarding/start", (_req, res) => {
  res.json({
    questionnaire: [
      { id: "q_mood", type: "scale", label: "How's your mood today?", min:1, max:5 },
      { id: "q_sleep", type: "scale", label: "Hours of sleep last night?", min:0, max:12 },
      { id: "q_goal", type: "select", label: "Pick a wellness goal", options:["Stress","Fitness","Focus","Hydration"] }
    ]
  });
});

// POST /onboarding/submit {answers:{...}}
app.post("/onboarding/submit", (req, res) => {
  const { answers } = req.body || {};
  if (!answers) return res.status(400).json({ error: "answers required" });
  // derive a tiny profile
  const goal = answers.q_goal || "Stress";
  const profile = {
    focus: goal,
    suggested_micro_quests: goal === "Hydration" ? ["Drink Water"] : ["2-min Breathing"]
  };
  res.json({ ok: true, profile });
});

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => console.log(`Auth/Onboarding mock on :${PORT}`));

