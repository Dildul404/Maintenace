'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('penunjukan', 'status', {
      type: Sequelize.ENUM(
        'berlangsung',
        'dibatalkan',
        'sukses'
      ),
      allowNull: false,
      defaultValue: 'berlangsung'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('penunjukan', 'status');
  }
};