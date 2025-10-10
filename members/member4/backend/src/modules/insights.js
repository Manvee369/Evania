// Plain JS sandbox version (no TS). Uses local JSON sample data.
const express = require("express");
const sample = require("./_sampleData.json");
const router = express.Router();

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }

// In real app you'd verify JWT; here we keep it open.
router.use((req, res, next) => next());

router.get("/weekly", (req, res) => {
  const today = startOfDay(new Date());
  const since = addDays(today, -6);

  const runs = sample.questRuns || [];
  const logs = sample.routineLogs || [];
  const baselineMood = Number(sample.baselineMood ?? 3);

  // init day buckets
  const buckets = {};
  for (let i = 0; i < 7; i++) {
    const d = addDays(since, i);
    const key = startOfDay(d).toISOString();
    buckets[key] = { dateISO: key, questsCompleted: 0, routineDone: false };
  }

  // fill runs
  runs.forEach(r => {
    const key = startOfDay(new Date(r.completedAt)).toISOString();
    if (buckets[key]) buckets[key].questsCompleted += 1;
  });

  // fill routine logs
  logs.forEach(l => {
    const key = startOfDay(new Date(l.date)).toISOString();
    if (buckets[key] && l.status === "done") buckets[key].routineDone = true;
  });

  const series = Object.values(buckets);
  const daysWithRoutine = series.filter(d => d.routineDone).length;
  const routineAdherence = Math.round((daysWithRoutine / 7) * 100);
  const avgMood = Math.max(1, Math.min(5, baselineMood || 3));

  let riskBand = "amber";
  if (routineAdherence >= 60 && avgMood >= 3) riskBand = "green";
  else if (routineAdherence < 30 || avgMood < 2) riskBand = "red";

  const questsCompleted = series.reduce((s, d) => s + d.questsCompleted, 0);
  const blurb = riskBand === "green"
    ? "Nice rhythm! Keep tiny wins going."
    : riskBand === "amber"
      ? "You’re on the path—try 1 micro-quest today."
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

module.exports = router;


