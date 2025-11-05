'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes for cart operations to speed up queries
    
    // Index for finding basket by userId (used in every cart operation)
    await queryInterface.addIndex('baskets', ['userId'], {
      name: 'baskets_userId_idx'
    });
    
    // Index for finding basket_device by basketId (used when querying cart items)
    await queryInterface.addIndex('basket_devices', ['basketId'], {
      name: 'basket_devices_basketId_idx'
    });
    
    // Index for finding basket_device by deviceId (used when adding to cart)
    await queryInterface.addIndex('basket_devices', ['deviceId'], {
      name: 'basket_devices_deviceId_idx'
    });
    
    // Composite index for the WHERE condition in findOrCreate
    await queryInterface.addIndex('basket_devices', ['basketId', 'deviceId'], {
      name: 'basket_devices_basketId_deviceId_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('baskets', 'baskets_userId_idx');
    await queryInterface.removeIndex('basket_devices', 'basket_devices_basketId_idx');
    await queryInterface.removeIndex('basket_devices', 'basket_devices_deviceId_idx');
    await queryInterface.removeIndex('basket_devices', 'basket_devices_basketId_deviceId_idx');
  }
};
