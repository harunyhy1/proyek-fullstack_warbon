const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes'); // Route untuk login/register
const apiRoutes = require('./routes/api');         // Route untuk students dan umum
const uploadRoutes = require('./routes/upload');   // Route untuk upload gambar

const app = express();
const PORT = process.env.PORT || 5000; // Menggunakan port 5000 sesuai log terminal Anda

// Middleware
app.use(cors()); // Mengizinkan akses dari domain luar (Frontend)
app.use(express.json()); // Agar server bisa membaca body JSON dari Postman

// Pendaftaran Route (Endpoint)
// Semua route di authRoutes.js akan diawali dengan /api/auth
app.use('/api/auth', authRoutes);

// Semua route di api.js akan diawali dengan /api
app.use('/api', apiRoutes);
app.use('/api', uploadRoutes);

// Endpoint Cek Koneksi Awal
app.get('/', (req, res) => {
    res.send('API Ordering System Running...');
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Menjalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});