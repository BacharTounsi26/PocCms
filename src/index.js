require("dotenv").config();

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
      // Allow requests with no origin (e.g. curl, Postman, server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
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

app.listen(config.port, () => {
  console.log(`BFF running on http://localhost:${config.port}`);
});
