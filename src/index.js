const express = require("express");
const config = require("./config");
const productsRouter = require("./routes/products");

const app = express();

// CORS — accept multiple origins (comma-separated in FRONTEND_URL)
const allowedOrigins = config.frontendUrl
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, "")) // trim whitespace AND trailing slashes
  .filter(Boolean);

console.log("[CORS] Allowed origins:", allowedOrigins);

// Manual CORS middleware — replaces cors() package for full control
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    const isAllowed =
      allowedOrigins.some((o) => origin === o) ||
      origin.endsWith(".contentstack.com");

    if (isAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    } else {
      console.warn(`[CORS] Blocked origin: "${origin}". Allowed: ${JSON.stringify(allowedOrigins)}`);
    }
  }

  // Handle preflight immediately
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

// Health check (also useful for verifying deployment)
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    allowedOrigins,
    frontendUrlRaw: config.frontendUrl,
  });
});

// Products route
app.use("/api", productsRouter);

const port = config.port;
app.listen(port, () => {
  console.log(`BFF running on port ${port}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});
