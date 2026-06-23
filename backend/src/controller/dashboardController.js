const db = require('../config/db'); // Sesuaikan path ke db.js lo bray

exports.getDashboardOverview = async (req, res) => {
  try {
    const [transaksi] = await db.query("SELECT SUM(total_harga) AS total_pendapatan FROM transaksi");
    const [ordersCount] = await db.query("SELECT COUNT(*) AS total_pesanan FROM orders");
    const [pelangganCount] = await db.query("SELECT COUNT(DISTINCT id_user) AS pelanggan_aktif FROM orders");

    const [recentOrders] = await db.query(`
      SELECT o.id_order, COALESCE(o.nama_pemesan, u.nama) AS nama_pelanggan, o.tipe_layanan, o.status,
             COALESCE((SELECT SUM(subtotal) FROM order_detail od WHERE od.id_order = o.id_order), 0) AS total_tagihan,
             (SELECT GROUP_CONCAT(CONCAT(m.nama_menu, ' x', od.jumlah) SEPARATOR ', ') 
              FROM order_detail od 
              JOIN menu m ON od.id_menu = m.id_menu 
              WHERE od.id_order = o.id_order) AS produk_ringkasan
      FROM orders o
      LEFT JOIN users u ON o.id_user = u.id_user
      ORDER BY o.id_order DESC
      LIMIT 5
    `);

    // ── POIN 1: QUERY LEADERBOARD PRODUK TERLARIS ──
    // Hitung total jumlah (SUM) item yang paling banyak terjual di order_detail
    const [topProducts] = await db.promise().query(`
      SELECT m.nama_menu, SUM(od.jumlah) AS total_terjual, m.harga, m.id_kategori
      FROM order_detail od
      JOIN menu m ON od.id_menu = m.id_menu
      GROUP BY od.id_menu
      ORDER BY total_terjual DESC
      LIMIT 4
    `);

    // Kirim paket data lengkap ke frontend
    res.json({
      status: 'success',
      data: {
        stats: {
          totalPendapatan: transaksi[0].total_pendapatan || 0,
          totalPesanan: ordersCount[0].total_pesanan || 0,
          pelangganAktif: pelangganCount[0].pelanggan_aktif || 0,
        },
        recentOrders,
        topProducts
      }
    });

  } catch (error) {
    console.error("Error Dashboard:", error);
    res.status(500).json({ status: 'error', message: 'Gagal muat data dashboard bray' });
  }
};