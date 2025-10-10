import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { db } from "./db.js";

const DEFAULT_TZ = "Asia/Kolkata";

const app = express();
app.use(cors());
app.use(express.json());

const sql = {
  getUser: db.prepare("SELECT * FROM users WHERE id = ?"),
  upsertUser: db.prepare(`
    INSERT INTO users(id, total_xp, level, current_streak, longest_streak, last_active_local_date, timezone, avatar_tier)
    VALUES(@id, @total_xp, @level, @current_streak, @longest_streak, @last_active_local_date, @timezone, @avatar_tier)
    ON CONFLICT(id) DO UPDATE SET
      total_xp=excluded.total_xp,
      level=excluded.level,
      current_streak=excluded.current_streak,
      longest_streak=excluded.longest_streak,
      last_active_local_date=excluded.last_active_local_date,
      timezone=excluded.timezone,
      avatar_tier=excluded.avatar_tier
  `),
  listQuests: db.prepare("SELECT * FROM quests WHERE active = 1"),
  getQuest: db.prepare("SELECT * FROM quests WHERE id = ? AND active = 1"),
  lastRunForQuest: db.prepare(`
    SELECT * FROM runs WHERE user_id = ? AND quest_id = ? ORDER BY created_at DESC LIMIT 1
  `),
  insertRun: db.prepare(`
    INSERT INTO runs(id, user_id, quest_id, gained_xp, streak_applied, created_at, local_date)
    VALUES(?, ?, ?, ?, ?, ?, ?)
  `),
  listRunsByUser: db.prepare("SELECT * FROM runs WHERE user_id = ? ORDER BY created_at DESC")
};

const computeLevel = (totalXP) => Math.floor(Math.sqrt(totalXP) / 2) + 1;

function localDateISO() {
  return dayjs().format("YYYY-MM-DD");
}

function applyStreakProgress(u) {
  const today = localDateISO();
  if (!u.last_active_local_date) {
    u.current_streak = 1;
  } else {
    const diff = dayjs(today).diff(dayjs(u.last_active_local_date), "day");
    if (diff === 0) {
      // same day
    } else if (diff === 1) {
      u.current_streak = (u.current_streak || 0) + 1;
    } else {
      u.current_streak = 1;
    }
  }
  u.longest_streak = Math.max(u.longest_streak || 0, u.current_streak || 0);
  u.last_active_local_date = today;
}

function streakMultiplier(streak) {
  if (!streak || streak < 1) return 1.0;
  const perDay = Math.min(0.05 * streak, 0.5);
  const band = Math.floor(streak / 7) * 0.1;
  return parseFloat((1.0 + perDay + band).toFixed(2));
}

// ensure demo user exists
app.use((req, _res, next) => {
  let userId = req.header("x-user-id");
  if (!userId) userId = "demo-user";
  let u = sql.getUser.get(userId);
  if (!u) {
    u = {
      id: userId,
      total_xp: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_active_local_date: null,
      timezone: DEFAULT_TZ,
      avatar_tier: 0
    };
    sql.upsertUser.run(u);
  }
  req.user = u;
  next();
});

app.get("/api/quests", (_req, res) => {
  res.json({ quests: sql.listQuests.all() });
});

app.get("/api/progress", (req, res) => {
  const u = sql.getUser.get(req.user.id);
  res.json({
    userId: u.id,
    totalXP: u.total_xp,
    level: u.level,
    currentStreak: u.current_streak,
    longestStreak: u.longest_streak,
    lastActiveDayISO: u.last_active_local_date,
    avatar: { tier: u.avatar_tier }
  });
});

app.post("/api/runs", (req, res) => {
  const u = { ...req.user };
  const { questId } = req.body || {};
  const q = sql.getQuest.get(questId);
  if (!q) return res.status(400).json({ error: "Invalid questId" });

  // cooldown
  if (q.cooldown_sec > 0) {
    const last = sql.lastRunForQuest.get(u.id, questId);
    if (last) {
      const lastMs = new Date(last.created_at).getTime();
      const nowMs = Date.now();
      if (nowMs - lastMs < q.cooldown_sec * 1000) {
        const waitSec = Math.ceil((q.cooldown_sec * 1000 - (nowMs - lastMs)) / 1000);
        return res.status(429).json({ error: "Cooldown active", retryAfterSec: waitSec });
      }
    }
  }

  const prevLevel = u.level;
  applyStreakProgress(u);

  const mult = streakMultiplier(u.current_streak);
  const gainedXP = Math.round(q.base_points * mult);

  u.total_xp += gainedXP;
  u.level = computeLevel(u.total_xp);

  if (u.level > prevLevel && u.level % 5 === 0) {
    u.avatar_tier = (u.avatar_tier || 0) + 1;
  }

  const trx = db.transaction(() => {
    sql.upsertUser.run(u);
    sql.insertRun.run(
      nanoid(),
      u.id,
      questId,
      gainedXP,
      u.current_streak,
      new Date().toISOString(),
      localDateISO()
    );
  });
  trx();

  const fresh = sql.getUser.get(u.id);
  res.json({
    run: {
      userId: fresh.id,
      questId,
      gainedXP,
      streakApplied: fresh.current_streak
    },
    progress: {
      totalXP: fresh.total_xp,
      level: fresh.level,
      currentStreak: fresh.current_streak,
      longestStreak: fresh.longest_streak,
      lastActiveDayISO: fresh.last_active_local_date,
      avatar: { tier: fresh.avatar_tier }
    },
    meta: {
      basePoints: q.base_points,
      streakMultiplier: mult,
      leveledUp: fresh.level > prevLevel
    }
  });
});

app.get("/api/runs", (req, res) => {
  res.json({ runs: sql.listRunsByUser.all(req.user.id) });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Evania XP/Streak backend (SQLite) listening on :${PORT}`));
