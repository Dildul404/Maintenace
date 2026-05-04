const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET semua barang
router.get('/', (req, res) => {
    const query = 'SELECT * FROM barang';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else {
            res.json({ success: true, data: results });
        }
    });
});

// GET barang by ID
router.get('/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM barang WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
        } else {
            res.json({ success: true, data: results[0] });
        }
    });
});

// POST tambah barang
router.post('/', (req, res) => {
    const { nama_barang, harga, unit_barang } = req.body;
    const query = 'INSERT INTO barang (nama_barang, harga, unit_barang) VALUES (?, ?, ?)';
    db.query(query, [nama_barang, harga, unit_barang], (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else {
            res.json({ success: true, message: 'Barang berhasil ditambahkan', id: results.insertId });
        }
    });
});

// PUT update barang
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { nama_barang, harga, unit_barang } = req.body;
    const query = 'UPDATE barang SET nama_barang = ?, harga = ?, unit_barang = ? WHERE id = ?';
    db.query(query, [nama_barang, harga, unit_barang, id], (err) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else {
            res.json({ success: true, message: 'Barang berhasil diupdate' });
        }
    });
});

// DELETE barang
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM barang WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else {
            res.json({ success: true, message: 'Barang berhasil dihapus' });
        }
    });
});

module.exports = router;