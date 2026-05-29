const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Op } = require('sequelize');

// POST new user
router.post('/', async (req, res) => {
    const { nama, email, password, role } = req.body;
    
    try {
        const newUser = await User.create({
            nama,
            email,
            password,
            role
        });
        
        res.status(201).json({ success: true, message: 'User berhasil disimpan', data: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data user', error: error.message });
    }
});

// GET user by username or email
router.get('/:email/:password', async (req, res) => {
    try {
        const dataUser = await User.findOne({ 
            where: {
                email: req.params.email,
                password: req.params.password
            }
        });
        res.json({ success: true, data: dataUser });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// DELETE user (optional)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await User.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.json({ success: true, message: 'User berhasil dihapus' });
        } else {
            res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus user', error: error.message });
    }
});

module.exports = router;