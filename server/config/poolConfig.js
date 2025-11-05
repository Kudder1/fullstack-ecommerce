module.exports = {
  max: 25,           // Max connections
  min: 3,            // Min connections always open
  acquire: 30000,    // 30s timeout to get a connection (prevent 499 on high load)
  idle: 10000,       // How long before closing idle connection
  evict: 1000,       // Check for idle connections every 1s
  connectionTimeoutMillis: 5000  // 5s to establish new DB connection
};
