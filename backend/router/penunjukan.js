const express = require('express');
const router = express.Router();
const { Penunjukan, Laporan } = require('../models');

// POST - Simpan penunjukan teknisi + update laporan.teknisi
router.post('/', async (req, res) => {
    const { id_laporan, id_teknisi, nama_teknisi, awal, akhir } = req.body;

    try {
        // 1. Buat data penunjukan
        const newPenunjukan = await Penunjukan.create({
            id_laporan,
            id_teknisi,
            awal: awal || new Date(),
            akhir: akhir || null
        });

        // 2. Update teknisi di tabel laporan
        await Laporan.update(
            { teknisi: nama_teknisi },
            { where: { id: id_laporan } }
        );

        res.status(201).json({
            success: true,
            message: 'Penunjukan teknisi berhasil disimpan',
            data: newPenunjukan
        });
    } catch (error) {
        console.error('Error creating penunjukan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menyimpan penunjukan',
            error: error.message
        });
    }
});

// GET - Ambil semua penunjukan
router.get('/', async (req, res) => {
    try {
        const data = await Penunjukan.findAll({
            order: [['id', 'DESC']]
        });
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching penunjukan:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// GET - Ambil penunjukan berdasarkan id_laporan
router.get('/laporan/:id_laporan', async (req, res) => {
    try {
        const data = await Penunjukan.findAll({
            where: { id_laporan: req.params.id_laporan },
            order: [['id', 'DESC']]
        });
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching penunjukan:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
