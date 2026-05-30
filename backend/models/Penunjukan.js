'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Penunjukan extends Model {
    static associate(models) {
      // relasi ke Teknisi
      Penunjukan.belongsTo(models.Teknisi, {
        foreignKey: 'id_teknisi',
        as: 'teknisi'
      });
    }
  }

  Penunjukan.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_laporan: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_teknisi: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    awal: {
      type: DataTypes.DATE,
      allowNull: false
    },
    akhir: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Penunjukan',
    tableName: 'penunjukan',
    timestamps: false
  });

  return Penunjukan;
};
