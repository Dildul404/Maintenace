'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('laporan', 'status', {
      type: Sequelize.ENUM(
        'menunggu',
        'proses',
        'selesai',
        'ditolak'
      ),
      allowNull: false,
      defaultValue: 'menunggu'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('laporan', 'status', {
      type: Sequelize.ENUM(
        'menunggu',
        'proses',
        'selesai'
      ),
      allowNull: false,
      defaultValue: 'menunggu'
    });
  }
};