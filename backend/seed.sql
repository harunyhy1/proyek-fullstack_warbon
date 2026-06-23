-- ============================================================
-- Seed Data untuk Warkop Si Bontot
-- Jalankan setelah struktur tabel dibuat
-- ============================================================

-- ── KATEGORI ─────────────────────────────────────────────
INSERT INTO kategori (id_kategori, nama_kategori) VALUES
(1, 'Kopi'),
(2, 'Non-Kopi'),
(3, 'Makanan'),
(4, 'Cemilan'),
(5, 'Minuman Segar');

-- ── MENU ─────────────────────────────────────────────────
INSERT INTO menu (id_menu, id_kategori, nama_menu, harga, gambar) VALUES
-- Kopi
(1,  1, 'Kopi Hitam',         5000,  'kopi-hitam.jpg'),
(2,  1, 'Kopi Susu',          8000,  'kopi-susu.jpg'),
(3,  1, 'Kopi Jahe',          7000,  'kopi-jahe.jpg'),
(4,  1, 'Kopi Aren',          10000, 'kopi-aren.jpg'),
(5,  1, 'Espresso',           12000, 'espresso.jpg'),
(6,  1, 'Cappuccino',         12000, 'cappuccino.jpg'),
(7,  1, 'Americano',          10000, 'americano.jpg'),
(8,  1, 'Kopi Tubruk',        6000,  'kopi-tubruk.jpg'),
(9,  1, 'Vietnam Drip',       13000, 'vietnam-drip.jpg'),
(10, 1, 'Es Kopi Susu',       12000, 'es-kopi-susu.jpg'),
(11, 1, 'Es Kopi Aren',       14000, 'es-kopi-aren.jpg'),
(12, 1, 'Es Kopi Gula Batu',  11000, 'es-kopi-gula-batu.jpg'),
(13, 1, 'Es Cappuccino',      13000, 'es-cappuccino.jpg'),

-- Non-Kopi
(14, 2, 'Teh Tarik',          8000,  'teh-tarik.jpg'),
(15, 2, 'Es Teh Manis',       5000,  'es-teh-manis.jpg'),
(16, 2, 'Susu Cokelat',       10000, 'susu-cokelat.jpg'),
(17, 2, 'Wedang Jahe',        7000,  'wedang-jahe.jpg'),
(18, 2, 'Matcha Latte',       15000, 'matcha-latte.jpg'),
(19, 2, 'Red Velvet Latte',   15000, 'red-velvet-latte.jpg'),
(20, 2, 'Teh Hijau',          6000,  'teh-hijau.jpg'),
(21, 2, 'Kopi Susu Kedelai',  12000, 'kopi-susu-kedelai.jpg'),

-- Makanan
(22, 3, 'Nasi Goreng Kampung', 15000, 'nasi-goreng.jpg'),
(23, 3, 'Mie Goreng Spesial',  12000, 'mie-goreng.jpg'),
(24, 3, 'Indomie Goreng',      8000,  'indomie-goreng.jpg'),
(25, 3, 'Indomie Rebus',       8000,  'indomie-rebus.jpg'),
(26, 3, 'Roti Bakar Cokelat',  10000, 'roti-bakar-cokelat.jpg'),
(27, 3, 'Roti Bakar Keju',     10000, 'roti-bakar-keju.jpg'),
(28, 3, 'Nasi Ayam Geprek',    15000, 'ayam-geprek.jpg'),
(29, 3, 'Kentang Goreng',      12000, 'kentang-goreng.jpg'),

-- Cemilan
(30, 4, 'Pisang Goreng',       7000,  'pisang-goreng.jpg'),
(31, 4, 'Tahu Crispy',         8000,  'tahu-crispy.jpg'),
(32, 4, 'Singkong Goreng',     6000,  'singkong-goreng.jpg'),
(33, 4, 'Tempe Mendoan',       7000,  'tempe-mendoan.jpg'),
(34, 4, 'French Fries',        12000, 'french-fries.jpg'),
(35, 4, 'Chicken Wings',       15000, 'chicken-wings.jpg'),
(36, 4, 'Cireng Isi',          8000,  'cireng-isi.jpg'),
(37, 4, 'Sosis Bakar',         10000, 'sosis-bakar.jpg'),

-- Minuman Segar
(38, 5, 'Jus Jeruk',           8000,  'jus-jeruk.jpg'),
(39, 5, 'Jus Alpukat',         10000, 'jus-alpukat.jpg'),
(40, 5, 'Es Campur',           12000, 'es-campur.jpg'),
(41, 5, 'Jus Mangga',          10000, 'jus-mangga.jpg'),
(42, 5, 'Es Kelapa Muda',      8000,  'es-kelapa-muda.jpg'),
(43, 5, 'Lemon Tea',           7000,  'lemon-tea.jpg');

-- Reset auto increment
ALTER TABLE menu AUTO_INCREMENT = 44;
ALTER TABLE kategori AUTO_INCREMENT = 6;
