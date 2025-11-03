'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      stripeSessionId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      stripePaymentIntentId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paypalOrderId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      paypalCaptureId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'usd'
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'cancelled'),
        defaultValue: 'pending'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      guestToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shippingName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shippingCity: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shippingCountry: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shippingLine1: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shippingLine2: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shippingPostalCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shippingState: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};
