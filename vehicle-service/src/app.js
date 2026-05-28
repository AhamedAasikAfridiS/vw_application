const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const vehicleRoutes = require("./routes/vehicleRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const { notFound } = require("./middleware/notFound");
const { env } = require("./config/env");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "vehicle-service" });
});

app.use("/api/vehicles", vehicleRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
