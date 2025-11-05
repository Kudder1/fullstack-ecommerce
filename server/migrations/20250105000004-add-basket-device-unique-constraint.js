'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add unique constraint on basketId + deviceId combo
    // This prevents duplicate items in a basket and enables ON CONFLICT
    await queryInterface.addConstraint('basket_devices', {
      fields: ['basketId', 'deviceId'],
      type: 'unique',
      name: 'basket_devices_basketId_deviceId_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'basket_devices',
      'basket_devices_basketId_deviceId_unique'
    );
  }
};
