const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Debug log to see paths hitting the gateway
app.use((req, _res, next) => {
  console.log("GW recv:", req.method, req.url);
  next();
});

// --- Member4 (insights) → :4040  (no rewrite) ---
app.use(
  "/insights",
  createProxyMiddleware({
    target: "http://127.0.0.1:4040",
    changeOrigin: true,
    logLevel: "debug"
  })
);

// --- Member2 (quests) → :4020  (rewrite /quests → /api) ---
app.use(
  "/quests",
  createProxyMiddleware({
    target: "http://127.0.0.1:4020",
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: (path) => {
      // exact /quests => /api/quests
      if (path === "/quests") return "/api/quests";
      // /quests/... => /api/...
      return path.replace(/^\/quests\//, "/api/");
    }
  })
);
// --- Member1 (auth + onboarding) → :4010 ---
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Gateway on :${PORT}`));
