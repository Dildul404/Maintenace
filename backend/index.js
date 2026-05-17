const express = require('express');
const app = express();

const path = require('path');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static folder for images
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const laporan = require('./router/laporan');

app.use('/laporan', laporan);

const teknisi = require('./router/teknisi');
app.use('/teknisi', teknisi);

const db = require('./models');

app.get('/', (req, res) => {
    res.send('Server Express berjalan');
});

// Sync database menggunakan Sequelize CLI configuration
db.sequelize.sync({ alter: true }).then(async () => {
    console.log('Tabel database telah disinkronisasi melalui Sequelize CLI');
    try {
        await db.sequelize.query('DROP TABLE IF EXISTS barang');
        console.log('Tabel barang telah dihapus (jika ada).');
    } catch (e) {
        console.error('Gagal menghapus tabel barang:', e);
    }
}).catch(err => {
    console.error('Gagal sinkronisasi database:', err);
});

app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});

// tes