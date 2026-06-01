'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Teknisi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Teknisi.init({
    nama: DataTypes.STRING,
    kategori: DataTypes.STRING,
    foto: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Teknisi',
  });

  Teknisi.associate = function (models) {
    Teknisi.hasMany(models.Penunjukan, {
      foreignKey: 'id_teknisi'
    });

    Teknisi.hasOne(models.User, {
      foreignKey: 'id_teknisi'
    });
  };

  return Teknisi;
};
