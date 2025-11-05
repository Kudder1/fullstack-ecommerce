'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to users table
    await queryInterface.addColumn('users', 'googleId', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'emailVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'emailVerificationId', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'emailVerificationIdExpireDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'passwordResetId', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'passwordResetIdExpireDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

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
