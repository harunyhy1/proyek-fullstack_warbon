const db = require('../config/db');

class Order {

    static async getAll() {
        const query = `
            SELECT o.*,
                    COALESCE((SELECT SUM(subtotal) FROM order_detail od WHERE od.id_order = o.id_order), 0) AS total_tagihan
            FROM orders o
            ORDER BY o.tanggal DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }
    static async createOrder(id_user, tipe_layanan, items) {
        const connection = await db.getConnection(); 
        
        try {
            await connection.beginTransaction();

            let total_harga = 0;
            const orderDetails = [];

            for (const item of items) {
                const [menuRows] = await connection.query('SELECT harga FROM menu WHERE id_menu = ?', [item.id_menu]);
                
                if (menuRows.length === 0) {
                    throw new Error(`Menu dengan ID ${item.id_menu} tidak ditemukan`);
                }

                const harga = menuRows[0].harga;
                const subtotal = harga * item.jumlah;
                total_harga += subtotal;

                // PERBAIKAN: Masukkan variabel 'harga' ke dalam memori array rincian pesanan
                orderDetails.push([item.id_menu, item.jumlah, harga, subtotal]);
            }

            const kode_order = `ORD-${Date.now()}`;

            const queryOrder = `INSERT INTO orders (kode_order, tipe_layanan, status, id_user) VALUES (?, ?, 'pending', ?)`;
            const [orderResult] = await connection.query(queryOrder, [kode_order, tipe_layanan, id_user]);
            const id_order = orderResult.insertId;

            // PERBAIKAN: Sesuaikan query agar menyuntikkan id_order, id_menu, jumlah, HARGA, dan subtotal
            const detailValues = orderDetails.map(detail => [id_order, detail[0], detail[1], detail[2], detail[3]]);
            const queryDetail = `INSERT INTO order_detail (id_order, id_menu, jumlah, harga, subtotal) VALUES ?`;
            await connection.query(queryDetail, [detailValues]);

            await connection.commit();
            return { id_order, kode_order, total_harga };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Order;