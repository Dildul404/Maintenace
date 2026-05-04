const express = require('express');
const router = express.Router();

router.get('/', (req,res) =>{
    const nama = req.query.nama;
    res.send(`Hallo ${nama}`);
});

router.get('/:id',(req,res) =>{
    const id = req.params.id;
    res.send(`Hallo user dengan id ${id}`);
});

router.post('/', (req,res) =>{
    const { username,password } = req.body;

    res.json({
        message : 'data diterima',
        username,
        password
    });
});

module.exports = router;