const db = require('../config/db'); // Pastikan ini mengarah ke file koneksi db kamu

class Menu {
    // Menampilkan semua data menu
    static getAll() {
        const sql = "SELECT * FROM menu ORDER BY created_at DESC";
        return db.query(sql);
    }

    // Menampilkan data by id
    static getByID(id) {
        const sql = "SELECT * FROM menu WHERE id_menu = ?";
        return db.query(sql, [id]);
    }

    // Create model data 
    static create(data) {
        const sql = `
        INSERT INTO menu (id_kategori, nama_menu, harga, gambar)
        VALUES (?, ?, ?, ?)
        `;
        return db.query(sql, [
            data.id_kategori || null,
            data.nama_menu,
            data.harga,
            data.gambar || null
        ]);
    }

    // Update model data
    static update(id, data) {
        const sql = `
        UPDATE menu SET id_kategori = ?, nama_menu = ?, harga = ?, gambar = ? WHERE id_menu = ?
        `;
        return db.query(sql, [
            data.id_kategori || null,
            data.nama_menu,
            data.harga,
            data.gambar || null,
            id
        ]);
    }

    // Delete model data
    static delete(id) {
        const sql = "DELETE FROM menu WHERE id_menu = ?";
        return db.query(sql, [id]);
    }
}

module.exports = Menu;