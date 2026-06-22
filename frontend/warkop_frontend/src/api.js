// ============================================================
//  src/api.js — Warkop API Service
//  Sesuai dengan backend Express di port 5000
//  Base: http://localhost:5000/api
// ============================================================

const BASE = 'http://localhost:5000/api';

// Helper: tambah Authorization header jika ada token
function headers(withAuth = false) {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function request(method, path, body, withAuth = false) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(withAuth),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
  return data;
}

// ── AUTH ──────────────────────────────────────────────────
// POST /api/auth/register  body: { nama, email, password, role? }
export const register = (body) => request('POST', '/auth/register', body);

// POST /api/auth/login  body: { email, password }
export const login = (body) => request('POST', '/auth/login', body);

// ── KATEGORI ─────────────────────────────────────────────
// GET /api/kategori  — public, returns { success, data: [{id_kategori, nama_kategori}] }
export const getKategori = () => request('GET', '/kategori');

// ── MENU ─────────────────────────────────────────────────
// GET /api/menu  — public, returns { success, data: [{id_menu, id_kategori, nama_menu, harga, created_at}] }
export const getMenu = () => request('GET', '/menu');

// GET /api/menu/:id
export const getMenuById = (id) => request('GET', `/menu/${id}`);

// POST /api/menu  — admin only, body: { id_kategori, nama_menu, harga }
export const createMenu = (body) => request('POST', '/menu', body, true);

// PUT /api/menu/:id  — admin only, body: { id_kategori, nama_menu, harga }
export const updateMenu = (id, body) => request('PUT', `/menu/${id}`, body, true);

// DELETE /api/menu/:id  — admin only
export const deleteMenu = (id) => request('DELETE', `/menu/${id}`, null, true);

// ── ORDERS ───────────────────────────────────────────────
// POST /api/orders  — auth required
// body: { tipe_layanan: 'dine_in'|'take_away', items: [{id_menu, jumlah}] }
// returns: { success, data: { id_order, kode_order, total_tagihan } }
export const createOrder = (body) => request('POST', '/orders', body);

// ── TRANSAKSI ────────────────────────────────────────────
// POST /api/transaksi  — auth required
// body: { id_order, metode_pembayaran: 'cash'|'transfer'|'qris' }
// returns: { success, data: { id_transaksi, id_order, total_harga, metode_pembayaran } }
export const bayar = (body) => request('POST', '/transaksi', body, true);

// ── AMBIL DATA UNTUK DASHBOARD ADMIN (Tambahkan di api.js) ──
// GET /api/orders — admin only, melihat semua pesanan masuk
export const getOrders = () => request('GET', '/orders', null, true);

// GET /api/transaksi — admin only, melihat semua riwayat pembayaran
export const getTransaksi = () => request('GET', '/transaksi', null, true);
