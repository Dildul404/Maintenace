const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Laporan } = require('../models');

router.get('/', async (req, res) => {
    try {
        const dataLaporan = await Laporan.findAll({ order: [['id', 'DESC']] });
        res.json({ success: true, data: dataLaporan });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

router.post('/', async (req, res) => {
    const { judul, deskripsi, kategori, teknisi, status, foto, createdAt } = req.body;
    
    let photoPath = null;

    if (foto && foto.startsWith('data:image')) {
        const matches = foto.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
            const ext = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            
            const uploadDir = path.join(__dirname, '../assets/images');
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const fileName = `laporan_${Date.now()}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            
            try {
                fs.writeFileSync(filePath, buffer);
                photoPath = `assets/images/${fileName}`; 
            } catch (err) {
                console.error('Gagal menyimpan foto:', err);
            }
        }
    }
    
    try {
        const newLaporan = await Laporan.create({
            judul,
            deskripsi,
            kategori,
            teknisi,
            status: status || 'menunggu',
            foto: photoPath,
            created_at: createdAt || new Date()
        });
        
        res.status(201).json({ message: 'Laporan berhasil disimpan', data: newLaporan });
    } catch (error) {
        console.error('Error creating laporan:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data ke database', error: error.message });
    }
});

// PUT update laporan
router.put('/:id', async (req, res) => {
    const { judul, deskripsi, kategori, teknisi, status, foto, createdAt } = req.body;
    
    let updateData = { judul, deskripsi, kategori, teknisi, status, created_at: createdAt };

    if (foto && foto.startsWith('data:image')) {
        const matches = foto.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
            const ext = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            
            const uploadDir = path.join(__dirname, '../assets/images');
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const fileName = `laporan_${Date.now()}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            
            try {
                fs.writeFileSync(filePath, buffer);
                updateData.foto = `assets/images/${fileName}`; 
            } catch (err) {
                console.error('Gagal menyimpan foto saat update:', err);
            }
        }
    }
    
    try {
        const [updated] = await Laporan.update(updateData, {
            where: { id: req.params.id }
        });
        
        if (updated) {
            res.json({ success: true, message: 'Laporan berhasil diupdate' });
        } else {
            res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error updating laporan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengupdate laporan', error: error.message });
    }
});

// DELETE laporan
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Laporan.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.json({ success: true, message: 'Laporan berhasil dihapus' });
        } else {
            res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error deleting laporan:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus laporan', error: error.message });
    }
});

module.exports = router;
