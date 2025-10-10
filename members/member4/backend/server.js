const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const axios = require("axios"); // <-- added for status checks

const app = express();
app.use(cors());
app.use(express.json());

// Debug log so you can see requests hitting the gateway
app.use((req, _res, next) => {
  console.log("GW recv:", req.method, req.url);
  next();
});

/* =========================
 * PROXIES
 * ========================= */

// --- Member4 (insights) on :4040 — keep /insights prefix
app.use(
  "/insights",
  createProxyMiddleware({
    target: "http://127.0.0.1:4040",
    changeOrigin: true,
    logLevel: "debug"
  })
);

// --- Member2 (quests) on :4020 — rewrite /quests -> /api
app.use(
  "/quests",
  createProxyMiddleware({
    target: "http://127.0.0.1:4020",
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: (path) => {
      if (path === "/quests") return "/api/quests"; // /quests -> /api/quests
      return path.replace(/^\/quests\//, "/api/");   // /quests/... -> /api/...
    }
  })
);

// --- Member1 (auth + onboarding) on :4010 (no rewrite)
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://127.0.0.1:4010",
    changeOrigin: true,
    logLevel: "debug"
  })
);
app.use(
  "/onboarding",
  createProxyMiddleware({
    target: "http://127.0.0.1:4010",
    changeOrigin: true,
    logLevel: "debug"
  })
);

/* =========================
 * STATUS ENDPOINTS
 * paste START (these are your routes “under the proxy blocks”)
 * ========================= */

async function ping(url) {
  const started = Date.now();
  try {
    const r = await axios.get(url, { timeout: 2000 });
    return { url, ok: true, status: r.status, ms: Date.now() - started };
  } catch (e) {
    return {
      url,
      ok: false,
      status: e.response?.status ?? null,
      ms: Date.now() - started,
      error: e.message
    };
  }
}

app.get("/status", async (_req, res) => {
  const checks = await Promise.allSettled([
    // direct backends
    ping("http://127.0.0.1:4010/health"),
    ping("http://127.0.0.1:4010/onboarding/start"),
    ping("http://127.0.0.1:4020/api/quests"),
    ping("http://127.0.0.1:4040/insights/weekly"),
    // through the gateway
    ping("http://127.0.0.1:4000/quests"),
    ping("http://127.0.0.1:4000/insights/weekly"),
    ping("http://127.0.0.1:4000/onboarding/start"),
  ]);

  const results = checks.map(c => c.value || { ok:false, error:"unexpected" });
  const allOk = results.every(r => r.ok);
  res.json({ allOk, results });
});

app.get("/", (_req, res) => res.redirect("/status/ui"));

app.get("/status/ui", async (_req, res) => {
  const { data } = await axios
    .get("http://127.0.0.1:4000/status")
    .catch(() => ({ data: null }));

  const rows = (data?.results || []).map(r => {
    const badge = r.ok ? "🟢" : "🔴";
    const status = r.status ?? "—";
    const ms = typeof r.ms === "number" ? `${r.ms}ms` : "—";
    return `<tr>
      <td style="padding:6px 10px;font-family:ui-monospace,monospace">${badge}</td>
      <td style="padding:6px 10px"><a href="${r.url}">${r.url}</a></td>
      <td style="padding:6px 10px;text-align:center">${status}</td>
      <td style="padding:6px 10px;text-align:right;color:#666">${ms}</td>
    </tr>`;
  }).join("");

  res.send(`
  <html><head><title>Evania Status</title></head>
  <body style="font-family:ui-sans-serif,system-ui;padding:18px">
    <h2 style="margin:0 0 12px">Evania • Local Status</h2>
    <p style="margin:0 0 16px;color:#666">Green = OK; click a URL to inspect the raw response.</p>
    <table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      <thead>
        <tr style="background:#f3f4f6">
          <th style="padding:8px 10px">OK</th>
          <th style="padding:8px 10px;text-align:left">Endpoint</th>
          <th style="padding:8px 10px">HTTP</th>
          <th style="padding:8px 10px">Latency</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body></html>`);
});
/* =========================
 * STATUS ENDPOINTS paste END
 * ========================= */

// LAST: helpful 404 for anything unmatched
app.use((req, res) => res.status(404).send(`Gateway 404: ${req.method} ${req.url}`));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Gateway on :${PORT}`));
