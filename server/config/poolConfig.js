module.exports = {
  max: 20,           // Max connections
  min: 2,            // Min connections always open
  acquire: 30000,    // How long to wait for a connection
  idle: 10000        // How long before closing idle connection
};
