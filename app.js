const { startServer } = require("./backend/app");

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Startup Error:", err);
    process.exit(1);
  });
}

module.exports = require("./backend/app");
