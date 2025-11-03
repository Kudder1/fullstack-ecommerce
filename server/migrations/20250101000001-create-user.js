'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'USER'
      },
      googleId: {
        type: Sequelize.STRING,
        unique: true
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      emailVerificationId: {
        type: Sequelize.STRING,
        unique: true
      },
      emailVerificationIdExpireDate: {
        type: Sequelize.DATE,
      },
      passwordResetId: {
        type: Sequelize.STRING,
        unique: true
      },
      passwordResetIdExpireDate: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('users');
  }
};
