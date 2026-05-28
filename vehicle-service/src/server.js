const app = require("./app");
const { env } = require("./config/env");
const { initializeDatabase } = require("./config/db");
const { seedVehicles } = require("./utils/seedVehicles");

async function startServer() {
  await initializeDatabase();
  await seedVehicles();

  app.listen(env.port, () => {
    console.log(`Vehicle service listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Vehicle service failed to start", error);
  process.exit(1);
});
