import { db } from "../db.js";

db.exec(`
  DELETE FROM runs;
  DELETE FROM users;
  DELETE FROM quests;
`);

db.exec(`
  INSERT INTO quests (id, title, base_points, category, cooldown_sec, active) VALUES
  ('q1', '2-min Breathing', 10, 'mindfulness', 0, 1),
  ('q2', 'Drink Water', 5, 'self-care', 3600, 1),
  ('q3', '10 Push-ups', 12, 'fitness', 0, 1),
  ('q4', 'Journal 3 lines', 15, 'reflection', 0, 1)
`);

console.log("Database reset & seeded.");
