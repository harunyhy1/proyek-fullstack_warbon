import { useState, useEffect } from 'react';
import { 
  getMenu, 
  getKategori, 
  createMenu, 
  updateMenu, 
  deleteMenu, 
  getOrders,      // Tambahan API pro
  getTransaksi    // Tambahan API pro
} from '../api';

function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function AdminPage() {
  const [tab, setTab]             = useState('dashboard'); // 'dashboard' | 'orders' | 'transaksi' | 'menu' | 'kategori'
  const [menu, setMenu]           = useState([]);
  const [kategori, setKategori]   = useState([]);
  const [orders, setOrders]       = useState([]);         // State Baru
  const [transaksi, setTransaksi] = useState([]);         // State Baru
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState('');

  // Modal state untuk Menu
  const [modal, setModal]     = useState(null);  // null | 'menu'
  const [form, setForm]       = useState({ id_kategori: '', nama_menu: '', harga: '' });
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);

  // Load semua data dari database secara paralel
  async function loadData() {
    setLoading(true);
    try {
      const [m, k, o, t] = await Promise.all([
        getMenu(), 
        getKategori(), 
        getOrders().catch(() => ({ data: [] })),      // fallback biar ga crash klo backend blm siap
        getTransaksi().catch(() => ({ data: [] }))   // fallback biar ga crash klo backend blm siap
      ]);
      
      setMenu(m.data || []);
      setKategori(k.data || []);
      setOrders(o.data || []);
      setTransaksi(t.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // Handler Menu (Bawaan lama tetap aman bray)
  function openAdd() {
    setForm({ id_kategori: kategori[0]?.id_kategori || '', nama_menu: '', harga: '' });
    setEditId(null);
    setModal('menu');
  }

  function openEdit(m) {
    setForm({ id_kategori: m.id_kategori || '', nama_menu: m.nama_menu, harga: m.harga });
    setEditId(m.id_menu);
    setModal('menu');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const body = { id_kategori: form.id_kategori || null, nama_menu: form.nama_menu, harga: parseInt(form.harga) };
      if (editId) await updateMenu(editId, body);
      else        await createMenu(body);
      setModal(null);
      loadData();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, nama) {
    if (!window.confirm(`Hapus menu "${nama}"?`)) return;
    try {
      await deleteMenu(id);
      loadData();
    } catch (e) {
      setErr(e.message);
    }
  }

  // ── KALKULASI METRIK PRO BISNIS WARKOP ──
  const totalMenu       = menu.length;
  const totalOmset      = transaksi.reduce((sum, t) => sum + t.total_harga, 0);
  const jumlahPesanan   = orders.length;
  const transaksiSukses = transaksi.length;

  return (
    <div className="admin-page">
      {/* ── SIDEBAR BARU: LEBIH LENGKAP & PRO ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span>☕</span>
          <div>
            <div className="brand-name">Warkop Sibontot</div>
            <div className="brand-sub">Management Panel</div>
          </div>
        </div>
        <nav>
          {[
            { key: 'dashboard', icon: '📊', label: 'Dashboard Overview' },
            { key: 'orders',    icon: '🛎️', label: 'Live Orders Monitor' },
            { key: 'transaksi', icon: '💸', label: 'Riwayat Keuangan' },
            { key: 'menu',      icon: '🍽️', label: 'Kelola Item Menu' },
            { key: 'kategori',  icon: '🏷️', label: 'Manajemen Kategori' },
          ].map(n => (
            <button
              key={n.key}
              className={`sidebar-nav ${tab === n.key ? 'active' : ''}`}
              onClick={() => setTab(n.key)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="admin-main">
        {err && <div className="err-box" style={{marginBottom: '15px'}}>⚠️ Error: {err}</div>}

        {/* ── 1. DASHBOARD TAB OVERVIEW ── */}
        {tab === 'dashboard' && (
          <>
            <div className="admin-header">
              <h1>Dashboard Overview</h1>
              <p>Analisis riil performa bisnis Warkop Sibontot kamu.</p>
            </div>
            
            {loading ? <Spinner /> : (
              <>
                {/* Grid Statistik Keuangan Riil */}
                <div className="stat-grid">
                  <StatCard icon="💰" label="Total Omset Penjualan" value={formatRp(totalOmset)} color="#2DD4A0" />
                  <StatCard icon="📦" label="Total Pesanan Masuk" value={`${jumlahPesanan} Pesanan`} color="#6C63FF" />
                  <StatCard icon="✅" label="Transaksi Sukses" value={`${transaksiSukses} Dibayar`} color="#FF9057" />
                  <StatCard icon="☕" label="Varian Menu Aktif" value={`${totalMenu} Produk`} color="#FFD166" />
                </div>

                {/* Seksi Tampilan Cepat Pesanan Terbaru */}
                <div className="admin-section-title" style={{marginTop: '30px'}}>Aktivitas Terkini</div>
                <div className="dashboard-double-column" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                  
                  {/* Mini Live Order */}
                  <div className="mini-card-panel" style={{background: '#1e1e1e', padding: '20px', borderRadius: '12px'}}>
                    <h3>🛎️ Pesanan Terbaru</h3>
                    <ul style={{listStyle: 'none', padding: 0, marginTop: '10px'}}>
                      {orders.slice(-5).reverse().map(o => (
                        <li key={o.id_order} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333'}}>
                          <span>{o.kode_order} <small style={{color: '#888'}}>({o.tipe_layanan === 'dine_in' ? 'Makan Di Sini' : 'Bawa Pulang'})</small></span>
                          <strong style={{color: 'var(--accent-color)'}}>{formatRp(o.total_tagihan)}</strong>
                        </li>
                      ))}
                      {orders.length === 0 && <p style={{color: '#666'}}>Belum ada pesanan hari ini.</p>}
                    </ul>
                  </div>

                  {/* Mini Cashflow */}
                  <div className="mini-card-panel" style={{background: '#1e1e1e', padding: '20px', borderRadius: '12px'}}>
                    <h3>💸 Pembayaran Masuk</h3>
                    <ul style={{listStyle: 'none', padding: 0, marginTop: '10px'}}>
                      {transaksi.slice(-5).reverse().map(t => (
                        <li key={t.id_transaksi} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333'}}>
                          <span>💳 ID #{t.id_transaksi} <small style={{color: '#aaa', textTransform: 'uppercase'}}>({t.metode_pembayaran})</small></span>
                          <strong style={{color: '#2DD4A0'}}>{formatRp(t.total_harga)}</strong>
                        </li>
                      ))}
                      {transaksi.length === 0 && <p style={{color: '#666'}}>Belum ada pembayaran masuk.</p>}
                    </ul>
                  </div>

                </div>
              </>
            )}
          </>
        )}

        {/* ── 2. TAB LIVE ORDERS MONITOR (FITUR BARU KELOMPOK PRO) ── */}
        {tab === 'orders' && (
          <>
            <div className="admin-header">
              <h1>🛎️ Live Orders Monitor</h1>
              <p>Pantau pesanan yang dibuat oleh pelanggan/waiter secara live.</p>
            </div>
            {loading ? <Spinner /> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kode Order</th>
                      <th>Tipe Layanan</th>
                      <th>Total Tagihan</th>
                      <th>Status Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const isPaid = transaksi.some(t => t.id_order === o.id_order);
                      return (
                        <tr key={o.id_order}>
                          <td><strong style={{color: '#FF9057'}}>{o.kode_order}</strong></td>
                          <td>
                            <span className={`badge ${o.tipe_layanan}`}>
                              {o.tipe_layanan === 'dine_in' ? '🍽️ Dine In' : '📦 Take Away'}
                            </span>
                          </td>
                          <td><strong>{formatRp(o.total_tagihan)}</strong></td>
                          <td>
                            <span style={{
                              padding: '4px 10px', 
                              borderRadius: '20px', 
                              fontSize: '12px',
                              background: isPaid ? 'rgba(45, 212, 160, 0.2)' : 'rgba(255, 144, 87, 0.2)',
                              color: isPaid ? '#2DD4A0' : '#FF9057',
                              border: isPaid ? '1px solid #2DD4A0' : '1px solid #FF9057'
                            }}>
                              {isPaid ? '✓ Lunas' : '⏳ Menunggu Pembayaran'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr><td colSpan="4" style={{textAlign:'center', color:'#666'}}>Belum ada pesanan masuk.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── 3. TAB RIWAYAT KEUANGAN (FITUR BARU CASHFLOW) ── */}
        {tab === 'transaksi' && (
          <>
            <div className="admin-header">
              <h1>💸 Riwayat Transaksi Finansial</h1>
              <p>Semua uang masuk yang sah dari tabel pembukuan <code>transaksi</code>.</p>
            </div>
            {loading ? <Spinner /> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID Transaksi</th>
                      <th>ID Order</th>
                      <th>Metode Pembayaran</th>
                      <th>Nominal Diterima</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksi.map(t => (
                      <tr key={t.id_transaksi}>
                        <td><span className="tbl-id">#{t.id_transaksi}</span></td>
                        <td><strong>Order ID {t.id_order}</strong></td>
                        <td>
                          <span style={{textTransform:'uppercase', fontWeight:'bold', fontSize:'13px'}}>
                            {t.metode_pembayaran === 'cash' ? '💵 Cash' : t.metode_pembayaran === 'qris' ? '📱 QRIS' : '🏦 Bank Transfer'}
                          </span>
                        </td>
                        <td><span style={{color: '#2DD4A0', fontWeight: 'bold'}}>{formatRp(t.total_harga)}</span></td>
                      </tr>
                    ))}
                    {transaksi.length === 0 && (
                      <tr><td colSpan="4" style={{textAlign:'center', color:'#666'}}>Belum ada record transaksi keuangan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── 4. TAB KELOLA MENU (Bawaan Lama yang Dipertahankan) ── */}
        {tab === 'menu' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Kelola Item Menu</h1>
                <p>{menu.length} item menu terdaftar di database</p>
              </div>
              <button className="btn-primary" onClick={openAdd}>+ Tambah Menu Baru</button>
            </div>
            {loading ? <Spinner /> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nama Menu</th>
                      <th>Kategori</th>
                      <th>Harga</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map(m => {
                      const kat = kategori.find(k => k.id_kategori === m.id_kategori);
                      return (
                        <tr key={m.id_menu}>
                          <td><span className="tbl-id">#{m.id_menu}</span></td>
                          <td><strong>{m.nama_menu}</strong></td>
                          <td><span className="tbl-kat">{kat?.nama_kategori || '—'}</span></td>
                          <td><span className="tbl-price">{formatRp(m.harga)}</span></td>
                          <td>
                            <div className="tbl-actions">
                              <button className="btn-edit" onClick={() => openEdit(m)}>Edit</button>
                              <button className="btn-del"  onClick={() => handleDelete(m.id_menu, m.nama_menu)}>Hapus</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── 5. TAB KATEGORI (Bawaan Lama yang Dipertahankan) ── */}
        {tab === 'kategori' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Manajemen Kategori</h1>
                <p>{kategori.length} kategori menu terdaftar</p>
              </div>
            </div>
            {loading ? <Spinner /> : (
              <div className="kat-grid">
                {kategori.map(k => {
                  const count = menu.filter(m => m.id_kategori === k.id_kategori).length;
                  return (
                    <div key={k.id_kategori} className="kat-admin-card">
                      <div className="kac-id">#{k.id_kategori}</div>
                      <div className="kac-name">{k.nama_kategori}</div>
                      <div className="kac-count">{count} produk berkaitan</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL FORM TAMBAH/EDIT MENU (Bawaan Lama yang Dipertahankan) ── */}
      {modal === 'menu' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2>{editId ? 'Edit Item Menu' : 'Tambah Item Menu'}</h2>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="field">
                <label>Nama Menu</label>
                <input
                  type="text"
                  placeholder="Contoh: Espresso Romano"
                  value={form.nama_menu}
                  onChange={e => setForm(f => ({ ...f, nama_menu: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Harga (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 18000"
                  value={form.formharga || form.harga}
                  onChange={e => setForm(f => ({ ...f, harga: e.target.value }))}
                  min="0"
                  required
                />
              </div>
              <div className="field">
                <label>Kategori</label>
                <select
                  value={form.id_kategori}
                  onChange={e => setForm(f => ({ ...f, id_kategori: parseInt(e.target.value) }))}
                >
                  <option value="">— Tanpa Kategori —</option>
                  {kategori.map(k => (
                    <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Input Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-Komponen Presentasional
function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color, background: '#1e1e1e', padding: '20px', borderRadius: '12px', borderLeft: `5px solid ${color}` }}>
      <div className="sc-icon" style={{fontSize: '24px', marginBottom: '5px'}}>{icon}</div>
      <div className="sc-val" style={{fontSize: '20px', fontWeight: 'bold', color: '#fff'}}>{value}</div>
      <div className="sc-label" style={{fontSize: '13px', color: '#888'}}>{label}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="loading-state" style={{textAlign: 'center', padding: '40px'}}>
      <p>🔄 Mengambil data real-time database...</p>
    </div>
  );
}