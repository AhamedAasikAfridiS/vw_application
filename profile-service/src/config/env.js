require("dotenv").config();

const env = {
  port: Number(process.env.PORT || 4003),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "postgresql://vw_admin:vw_password@localhost:5432/profiledb",
  jwtSecret: process.env.JWT_SECRET || "dev_access_secret_change_me",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173"
};

module.exports = { env };
