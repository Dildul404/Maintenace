'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('teknisis', 'email');
    await queryInterface.removeColumn('teknisis', 'password');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('teknisis', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('teknisis', 'password', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};