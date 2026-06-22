const db = require('../config/db');

class Transaksi {

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM transaksi');
        return rows;
    }
    static async prosesPembayaran(id_order, metode_pembayaran) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Cek apakah pesanan ada dan statusnya masih 'pending'
            const [orderRows] = await connection.query('SELECT status FROM orders WHERE id_order = ?', [id_order]);
            if (orderRows.length === 0) {
                throw new Error('Pesanan tidak ditemukan');
            }
            if (orderRows[0].status !== 'pending') {
                throw new Error('Pesanan ini sudah dibayar atau dibatalkan');
            }

            // 2. Hitung total_harga dengan menjumlahkan subtotal di order_detail
            const [detailRows] = await connection.query('SELECT SUM(subtotal) as total FROM order_detail WHERE id_order = ?', [id_order]);
            const total_harga = detailRows[0].total || 0;

            if (total_harga === 0) {
                throw new Error('Rincian pesanan kosong, tidak bisa diproses');
            }

            // 3. Masukkan data struk ke tabel transaksi
            const queryTransaksi = `INSERT INTO transaksi (id_order, total_harga, metode_pembayaran) VALUES (?, ?, ?)`;
            const [transaksiResult] = await connection.query(queryTransaksi, [id_order, total_harga, metode_pembayaran]);

            // 4. Ubah status pesanan menjadi 'selesai' di tabel orders
            const queryUpdateOrder = `UPDATE orders SET status = 'selesai' WHERE id_order = ?`;
            await connection.query(queryUpdateOrder, [id_order]);

            await connection.commit();
            return {
                id_transaksi: transaksiResult.insertId,
                id_order: id_order,
                total_harga: total_harga,
                metode_pembayaran: metode_pembayaran
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Transaksi;