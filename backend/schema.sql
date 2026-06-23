-- ============================================================
-- Complete Schema for Warkop Si Bontot
-- Drop & recreate all tables
-- ============================================================

DROP TABLE IF EXISTS transaksi;
DROP TABLE IF EXISTS detail_pesanan;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu;
DROP TABLE IF EXISTS kategori;
DROP TABLE IF EXISTS users;

-- ── USERS ─────────────────────────────────────────────────
CREATE TABLE users (
  id_user INT(11) NOT NULL AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','kasir','pelanggan') DEFAULT 'pelanggan',
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_user),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── KATEGORI ──────────────────────────────────────────────
CREATE TABLE kategori (
  id_kategori INT(11) NOT NULL AUTO_INCREMENT,
  nama_kategori VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_kategori)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── MENU ──────────────────────────────────────────────────
CREATE TABLE menu (
  id_menu INT(11) NOT NULL AUTO_INCREMENT,
  id_kategori INT(11) DEFAULT NULL,
  nama_menu VARCHAR(150) NOT NULL,
  harga INT(11) NOT NULL,
  gambar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_menu),
  KEY id_kategori (id_kategori),
  CONSTRAINT menu_ibfk_1 FOREIGN KEY (id_kategori) REFERENCES kategori (id_kategori) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── ORDERS ────────────────────────────────────────────────
CREATE TABLE orders (
  id_order INT(11) NOT NULL AUTO_INCREMENT,
  kode_order VARCHAR(50) NOT NULL,
  tanggal TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  nama_pemesan VARCHAR(100) DEFAULT NULL,
  tipe_layanan VARCHAR(20) DEFAULT NULL,
  status VARCHAR(20) DEFAULT NULL,
  id_user INT(11) DEFAULT NULL,
  PRIMARY KEY (id_order),
  UNIQUE KEY kode_order (kode_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── ORDER DETAIL ────────────────────────────────────────
CREATE TABLE order_detail (
  id_detail INT(11) NOT NULL AUTO_INCREMENT,
  id_order INT(11) DEFAULT NULL,
  id_menu INT(11) DEFAULT NULL,
  jumlah INT(11) NOT NULL DEFAULT 1,
  harga INT(11) NOT NULL,
  subtotal INT(11) NOT NULL,
  PRIMARY KEY (id_detail),
  KEY id_order (id_order),
  KEY id_menu (id_menu),
  CONSTRAINT order_detail_ibfk_1 FOREIGN KEY (id_order) REFERENCES orders (id_order) ON DELETE CASCADE,
  CONSTRAINT order_detail_ibfk_2 FOREIGN KEY (id_menu) REFERENCES menu (id_menu) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── TRANSAKSI ─────────────────────────────────────────────
CREATE TABLE transaksi (
  id_transaksi INT(11) NOT NULL AUTO_INCREMENT,
  id_order INT(11) DEFAULT NULL,
  total_harga INT(11) NOT NULL,
  metode_pembayaran VARCHAR(20) DEFAULT NULL,
  waktu_bayar TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_transaksi),
  KEY id_order (id_order),
  CONSTRAINT transaksi_ibfk_1 FOREIGN KEY (id_order) REFERENCES orders (id_order) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
