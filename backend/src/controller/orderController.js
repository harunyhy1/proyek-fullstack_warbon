const Order = require("../model/order");
const errorHandler = require("../utils/errorhandler");

class OrderController {
    async create(req, res) {
        try {
            const id_user = req.user ? req.user.id : null;
            const { tipe_layanan, items, nama_pemesan } = req.body;

            if (!items || items.length === 0) {
                return errorHandler(res, "Keranjang belanja kosong", 400, "Bad Request");
            }

            const result = await Order.createOrder(id_user, tipe_layanan, items, nama_pemesan);

            res.status(201).json({
                success: true,
                message: "Pesanan berhasil dibuat, silakan menuju kasir",
                data: {
                    id_order: result.id_order,
                    kode_order: result.kode_order,
                    total_tagihan: result.total_harga
                }
            });

        } catch (err) {
            return errorHandler(res, err, 500, err.message || "Gagal membuat pesanan");
        }
    }

    async index(req, res) {
        try {
            // Memanggil fungsi dari model untuk mengambil semua data pesanan
            // Pastikan di file model/order.js kamu memiliki fungsi getAll() atau sesuaikan namanya
            const orders = await Order.getAll(); 
            
            res.status(200).json({
                success: true,
                data: orders
            });
        } catch (err) {
            return errorHandler(res, err, 500, err.message || "Gagal mengambil daftar pesanan");
        }
    }
}

module.exports = new OrderController();