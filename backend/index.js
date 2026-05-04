const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const barang = require('./router/barang');

app.use('/barang', barang);

app.get('/', (req, res) =>{
    res.send('Server Express berjalan');
});

app.listen(3000, ()=> {
    console.log('Server berjalan di http://localhost:3000');
});

// tes