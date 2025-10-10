const BASE = process.env.EXPO_PUBLIC_API_BASE!;
export const api = {
  login: (email: string, password: string) =>
    fetch(`${BASE}/auth/login`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, password }) }).then(r=>r.json()),
  onboardingStart: () => fetch(`${BASE}/onboarding/start`).then(r=>r.json()),
  insightsWeekly: () => fetch(`${BASE}/insights/weekly`).then(r=>r.json()),
  questsList: () => fetch(`${BASE}/quests`).then(r=>r.json())
};
