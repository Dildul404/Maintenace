const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Teknisi } = require('../models');

// GET all teknisi
router.get('/', async (req, res) => {
    try {
        const dataTeknisi = await Teknisi.findAll({ order: [['id', 'DESC']] });
        res.json({ success: true, data: dataTeknisi });
    } catch (error) {
        console.error('Error fetching teknisi:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// POST new teknisi
router.post('/', async (req, res) => {
    const { nama, kategori, foto } = req.body;
    
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
            
            const fileName = `teknisi_${Date.now()}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            
            try {
                fs.writeFileSync(filePath, buffer);
                photoPath = `assets/images/${fileName}`; 
            } catch (err) {
                console.error('Gagal menyimpan foto teknisi:', err);
            }
        }
    }
    
    try {
        const newTeknisi = await Teknisi.create({
            nama,
            kategori,
            foto: photoPath
        });
        
        res.status(201).json({ success: true, message: 'Teknisi berhasil disimpan', data: newTeknisi });
    } catch (error) {
        console.error('Error creating teknisi:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data teknisi', error: error.message });
    }
});

// DELETE teknisi (optional)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Teknisi.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.json({ success: true, message: 'Teknisi berhasil dihapus' });
        } else {
            res.status(404).json({ success: false, message: 'Teknisi tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error deleting teknisi:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus teknisi', error: error.message });
    }
});

module.exports = router;
