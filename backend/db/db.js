const mysql = require('mysql2');

// buat koneksi
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'maintenance'
});

// cek koneksi
db.connect((err) => {
    if (err) {
        console.error('Koneksi gagal:', err);
    } else {
        console.log('Koneksi ke database berhasil');
    }
});

module.exports = db;