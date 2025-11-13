'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('users');
    
    // Only add columns if they don't already exist
    if (!tableInfo.googleId) {
      await queryInterface.addColumn('users', 'googleId', {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      });
    }

    if (!tableInfo.emailVerified) {
      await queryInterface.addColumn('users', 'emailVerified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });
    }

    if (!tableInfo.emailVerificationId) {
      await queryInterface.addColumn('users', 'emailVerificationId', {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      });
    }

    if (!tableInfo.emailVerificationIdExpireDate) {
      await queryInterface.addColumn('users', 'emailVerificationIdExpireDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!tableInfo.passwordResetId) {
      await queryInterface.addColumn('users', 'passwordResetId', {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      });
    }

    if (!tableInfo.passwordResetIdExpireDate) {
      await queryInterface.addColumn('users', 'passwordResetIdExpireDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Change password column to allow NULL (for Google OAuth users)
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns
    await queryInterface.removeColumn('users', 'googleId');
    await queryInterface.removeColumn('users', 'emailVerified');
    await queryInterface.removeColumn('users', 'emailVerificationId');
    await queryInterface.removeColumn('users', 'emailVerificationIdExpireDate');
    await queryInterface.removeColumn('users', 'passwordResetId');
    await queryInterface.removeColumn('users', 'passwordResetIdExpireDate');

    // Revert password column back to NOT NULL
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
