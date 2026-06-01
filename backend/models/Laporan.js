module.exports = (sequelize, DataTypes) => {
    const Laporan = sequelize.define('Laporan', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        judul: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        deskripsi: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        kategori: {
            type: DataTypes.STRING(100)
        },
        teknisi: {
            type: DataTypes.STRING(100)
        },
        status: {
            type: DataTypes.ENUM('menunggu', 'proses', 'selesai'),
            defaultValue: 'menunggu'
        },
        foto: {
            type: DataTypes.STRING(255)
        },
        verifikasi: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'laporan',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Laporan.associate = function (models) {
        Laporan.hasMany(models.Penunjukan, {
            foreignKey: 'id_laporan'
        });
    };

    return Laporan;
};
