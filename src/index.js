const express = require("express");
const cors = require("cors");
const config = require("./config");
const productsRouter = require("./routes/products");

const app = express();

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ["GET"],
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
