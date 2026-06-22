//biasanya routing api ini disebut dengan endpoint
const AuthController = require("../controller/authcontroller");
const MenuController = require("../controller/menuController");
const KategoriController = require("../controller/kategoriController");
const OrderController = require("../controller/orderController");
const TransaksiController = require("../controller/transaksiController");
const dashboardController = require('../controller/dashboardController');
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.get("/", (req, res) =>{
    res.send("Hello Express");
});

// ==========================================
// RUTE PUBLIC (Bisa diakses tanpa login)
// ==========================================
// Pelanggan harus bisa melihat menu tanpa harus login dulu
router.get("/menu", MenuController.index);
router.get("/menu/:id", MenuController.show);
router.get("/kategori", KategoriController.index);
router.post("/orders", OrderController.create);
router.post("/transaksi", TransaksiController.bayar);


// ==========================================
// RUTE PROTECTED (Wajib login & akses admin)
// ==========================================
// Hanya admin yang boleh menambah, mengubah, dan menghapus menu
router.post("/menu", auth, authorize("admin"), MenuController.store);
router.put("/menu/:id", auth, authorize("admin"), MenuController.update);
router.delete("/menu/:id", auth, authorize("admin"), MenuController.destroy);
router.get('/dashboard/overview', dashboardController.getDashboardOverview);

module.exports = router;