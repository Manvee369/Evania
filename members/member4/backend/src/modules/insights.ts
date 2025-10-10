// Sandbox version for Member D.
// When merging: move to backend/src/modules/insights.ts and wire in index.ts.

import { Router } from "express";
// In sandbox, we use mock data; when merging, swap to real prisma imports.
// import { prisma } from "../../db"; // <-- use this after merge
import sample from "./_sampleData.json"; // mock

const router = Router();

// --- helpers ---
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
type DayBucket = { dateISO: string; questsCompleted: number; routineDone: boolean };

// --- auth (sandbox) ---
// In real app, replace with JWT verify middleware.
router.use((_req, _res, next) => { next(); });

// GET /insights/weekly
router.get("/weekly", async (_req, res) => {
  // Window: last 7 days (incl. today)
  const today = startOfDay(new Date());
  const since = addDays(today, -6);

  // MOCK reads (replace with prisma in merge)
  // const uid = req.user.uid as string;
  // const runs = await prisma.questRun.findMany({...})
  // const logs = await prisma.routineLog.findMany({...})
  const runs = sample.questRuns || [];
  const logs = sample.routineLogs || [];
  const baselineMood = Number(sample.baselineMood ?? 3); // 1..5

  // buckets
  const buckets: Record<string, DayBucket> = {};
  for (let i = 0; i < 7; i++) {
    const d = addDays(since, i);
    const key = startOfDay(d).toISOString();
    buckets[key] = { dateISO: key, questsCompleted: 0, routineDone: false };
  }

  runs.forEach((r: { completedAt: string }) => {
    const key = startOfDay(new Date(r.completedAt)).toISOString();
    if (buckets[key]) buckets[key].questsCompleted += 1;
  });

  logs.forEach((l: { date: string; status: string }) => {
    const key = startOfDay(new Date(l.date)).toISOString();
    if (buckets[key] && l.status === "done") buckets[key].routineDone = true;
  });

  const series = Object.values(buckets); // chronological
  const daysWithRoutine = series.filter(d => d.routineDone).length;
  const routineAdherence = Math.round((daysWithRoutine / 7) * 100); // %

  const avgMood = Math.max(1, Math.min(5, baselineMood || 3));

  // non-diagnostic risk band
  let riskBand: "green" | "amber" | "red" = "amber";
  if (routineAdherence >= 60 && avgMood >= 3) riskBand = "green";
  else if (routineAdherence < 30 || avgMood < 2) riskBand = "red";

  const questsCompleted = series.reduce((s, d) => s + d.questsCompleted, 0);
  const blurb =
    riskBand === "green" ? "Nice rhythm! Keep tiny wins going."
    : riskBand === "amber" ? "You’re on the path—try 1 micro-quest today."
    : "Be kind to yourself. Start with one small action.";

  res.json({
    range: { from: since.toISOString(), to: addDays(today, 1).toISOString() },
    series,
    totals: { questsCompleted, routineAdherence, avgMood },
    riskBand,
    blurb,
    disclaimer: "For wellness reflection only; not a diagnosis."
  });
});

export default router;

/*
MERGE NOTES:
1) Move this file to backend/src/modules/insights.ts
2) Replace mock reads with Prisma queries using the real models:
   - questRun (status: 'completed', completedAt gte/lte range)
   - routineLog (date gte/lte, status === 'done')
   - onboardAnswer (key: 'baseline_mood') optional
3) In backend/src/index.ts: app.use('/insights', insightsRouter)
*/
