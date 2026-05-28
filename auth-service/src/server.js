const app = require("./app");
const { env } = require("./config/env");
const { initializeDatabase } = require("./config/db");

async function startServer() {
  await initializeDatabase();

  app.listen(env.port, () => {
    console.log(`Auth service listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Auth service failed to start", error);
  process.exit(1);
});
