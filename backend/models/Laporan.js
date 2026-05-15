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
        }
    }, {
        tableName: 'laporan',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false // Di tabel SQL kita tidak ada updated_at
    });
    
    return Laporan;
};
