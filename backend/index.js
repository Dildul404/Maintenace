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

const user = require('./router/user');
app.use('/user', user);

const penunjukan = require('./router/penunjukan');
app.use('/penunjukan', penunjukan);

app.get('/', (req, res) => {
    res.send('Server Express berjalan');
});

app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});