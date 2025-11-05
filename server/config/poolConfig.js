module.exports = {
  max: 25,           // Max connections
  min: 3,            // Min connections always open
  acquire: 10000,    // 10s timeout to get a connection (fail fast)
  idle: 10000        // How long before closing idle connection
};
