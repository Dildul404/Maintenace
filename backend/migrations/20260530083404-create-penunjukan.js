'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('penunjukan', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      id_teknisi: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teknisis',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      awal: {
        type: Sequelize.DATE,
        allowNull: false
      },

      akhir: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('penunjukan');
  }
};