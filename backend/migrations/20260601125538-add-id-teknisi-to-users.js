'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'id_teknisi', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'teknisis',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'id_teknisi');
  }
};