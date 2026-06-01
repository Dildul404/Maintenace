const express = require('express');
const router = express.Router();
const { Penunjukan, Laporan, Teknisi } = require('../models');

// POST - Assign teknisi ke laporan
router.post('/', async (req, res) => {
    const { id_laporan, id_teknisi, awal, akhir } = req.body;

    try {
        // Cari teknisi
        const teknisi = await Teknisi.findByPk(id_teknisi);

        if (!teknisi) {
            return res.status(404).json({
                success: false,
                message: 'Teknisi tidak ditemukan'
            });
        }

        // Simpan penunjukan
        const newPenunjukan = await Penunjukan.create({
            id_laporan,
            id_teknisi,
            awal,
            akhir,
            status: 'berlangsung'
        });

        // Update kolom teknisi pada laporan
        await Laporan.update(
            {
                teknisi: teknisi.nama
            },
            {
                where: {
                    id: id_laporan
                }
            }
        );

        res.status(201).json({
            success: true,
            message: 'Penunjukan berhasil dibuat',
            data: newPenunjukan
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET - Simpan penunjukan teknisi + update laporan.teknisi
router.get('/', async (req, res) => {
    try {
        const data = await Penunjukan.findAll({
            include: [
                {
                    model: Laporan,
                    attributes: ['judul']
                },
                {
                    model: Teknisi,
                    attributes: ['nama']
                }
            ],
            order: [['id', 'DESC']]
        });

        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
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
