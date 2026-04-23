const express = require("express");
const cors = require("cors");
const config = require("./config");
const productsRouter = require("./routes/products");

const app = express();

// CORS — accept multiple origins (comma-separated in FRONTEND_URL)
const allowedOrigins = config.frontendUrl
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => origin === o || origin.endsWith(".contentstack.com"))) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Products route
app.use("/api", productsRouter);

const port = config.port;
app.listen(port, () => {
  console.log(`BFF running on port ${port}`);
});
