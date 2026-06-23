import { useState, useEffect } from 'react';
import {
  getMenu,
  getKategori,
  createMenu,
  updateMenu,
  deleteMenu,
  getOrders,
  getTransaksi,
  bayar,
  uploadImage,
  UPLOADS_URL
} from '../api';

function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function AdminPage({ onNavigate }) {
  const [tab, setTab]             = useState('dashboard'); // 'dashboard' | 'orders' | 'transaksi' | 'menu' | 'kategori'
  const [menu, setMenu]           = useState([]);
  const [kategori, setKategori]   = useState([]);
  const [orders, setOrders]       = useState([]);         // State Baru
  const [transaksi, setTransaksi] = useState([]);         // State Baru
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState('');
  const [toast, setToast]         = useState(null);
  const [time, setTime] = useState(new Date());

  // Modal state untuk Menu
  const [modal, setModal]     = useState(null);  // null | 'menu'
  const [modalBayar, setModalBayar] = useState(null);
  const [metodeBayar, setMetodeBayar] = useState('cash');
  const [form, setForm]       = useState({ id_kategori: '', nama_menu: '', harga: '' });
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [gambarFile, setGambarFile] = useState(null);
  const [gambarPreview, setGambarPreview] = useState(null);

  // ── FUNGSI SUARA SINTESIS 
  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // Nada melodi "Tring!" ceria (Kombinasi nada D5 ke A5)
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); 
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); 
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Audio play blocked by browser interaction policy", e);
    }
  }

  useEffect(() => {
  // Update jam setiap 1 detik (1000 milidetik)
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Bersihkan interval saat pindah halaman biar gak memory leak
    return () => clearInterval(timer);
  }, []);

  // Helper Format Tanggal Indonesia (Contoh: Kamis, 4 Juni 2026)
  const formatTanggal = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper Format Jam (Contoh: 18:59:34 WIB)
  const formatJam = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WIB';
  };

  // Load semua data dari database secara paralel
  async function loadData() {
    setLoading(true);
    try {
      const [m, k, o, t] = await Promise.all([
        getMenu(),
        getKategori(),
        getOrders(),
        getTransaksi()
      ]);
      
        setMenu(Array.isArray(m) ? m : m.data || []);
        setKategori(Array.isArray(k) ? k : k.data || []);
        setOrders(Array.isArray(o) ? o : o.data || []);
        setTransaksi(Array.isArray(t) ? t : t.data || []);
    }
      catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }

  }

  async function submitBayar() {
    try {
      await bayar({ id_order: modalBayar, metode_pembayaran: metodeBayar });
      alert("Pembayaran berhasil!");
      setModalBayar(null);
      loadData();
    } catch (e) {
      alert("Gagal memproses: " + e.message);
    }
  }

  // Fungsi khusus untuk nge-cek pesanan baru secara background
  async function checkNewOrders() {
    try {
      const o = await getOrders();
      const newOrders = o.data || [];
      
      setOrders(prevOrders => {
        // Jika jumlah orderan di database bertambah dari jumlah sebelumnya
        if (prevOrders.length > 0 && newOrders.length > prevOrders.length) {
          const latestOrder = newOrders[newOrders.length - 1];
          const nama = latestOrder.nama_pemesan || latestOrder.nama_user || '';
          
          setToast({
            kode: latestOrder.kode_order,
            nama: nama,
            total: latestOrder.total_tagihan
          });
          
          // Bunyikan Bell Kasir
          playNotificationSound();
          
          // Hilangkan toast secara otomatis setelah 4 detik
          setTimeout(() => setToast(null), 4000);
        }
        return newOrders;
      });
    } catch (e) {
      console.error("Gagal melakukan background check pesanan:", e);
    }
  }

  // Jalankan polling saat halaman admin terbuka
  useEffect(() => {
    loadData(); // Load pertama kali untuk semua data

    // Set interval biar aplikasi nge-cek ke backend tiap 5000ms (5 detik)
    const intervalId = setInterval(() => {
      checkNewOrders();
    }, 5000);

    // Bersihkan interval kalau admin pindah halaman biar gak memory leak
    return () => clearInterval(intervalId);
  }, []);

  // Handler Menu (Bawaan lama tetap aman bray)
  function openAdd() {
    setForm({ id_kategori: kategori[0]?.id_kategori || '', nama_menu: '', harga: '' });
    setGambarFile(null);
    setGambarPreview(null);
    setEditId(null);
    setModal('menu');
  }

  function openEdit(m) {
    setForm({ id_kategori: m.id_kategori || '', nama_menu: m.nama_menu, harga: m.harga });
    setGambarFile(null);
    setGambarPreview(m.gambar ? `${UPLOADS_URL}/${m.gambar}` : null);
    setEditId(m.id_menu);
    setModal('menu');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      let gambar;
      if (gambarFile) {
        const uploadRes = await uploadImage(gambarFile);
        gambar = uploadRes.filename;
      }
      const body = {
        id_kategori: form.id_kategori || null,
        nama_menu: form.nama_menu,
        harga: parseInt(form.harga),
      };
      if (editId) {
        if (gambar) body.gambar = gambar;
        await updateMenu(editId, body);
      } else {
        body.gambar = gambar || null;
        await createMenu(body);
      }
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
  // Tambahan data leaderboard untuk demo kelompok bray
  const menuTerlaris = [
    { nama: 'Es Kopi Susu Warkop', terjual: 48, harga: 15000, emoji: '☕' },
    { nama: 'Mie Instan Goreng Nyemek', terjual: 36, harga: 12000, emoji: '🍜' },
    { nama: 'Pancong Lumer Keju', terjual: 24, height: 10000, emoji: '🥞' },
  ];

  return (
    <div className="admin-page">
      {/* ── SIDEBAR BARU: LEBIH LENGKAP & PRO ── */}
      <aside className="admin-sidebar">
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

        {/* ── Tombol Kembali ── */}
        <button
          onClick={() => onNavigate('menu')}
          style={{
            background: 'none', border: 'none', color: '#ffb347', cursor: 'pointer',
            fontSize: '15px', padding: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '6px',
            marginTop: '-5px'
          }}
        >
          ← Kembali ke Menu
        </button>

        {/* ── 1. DASHBOARD TAB OVERVIEW ── */}
        {tab === 'dashboard' && (
          <>
            <div className="admin-header">
              <h1>Dashboard Overview</h1>
              <p>Analisis riil performa bisnis Warkop Sibontot kamu.</p>
            </div>
            
            {/* ── WIDGET JAM & TANGGAL REALTIME OVERVIEW ── */}
            <div className="admin-clock-widget" style={{
              background: '#1e1e1e',
              borderLeft: '5px solid #FF9057', // Warna khas warkop kita bray
              borderRadius: '8px',
              padding: '15px 25px',
              marginBottom: '25px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              borderTop: '1px solid #2d2d2d',
              borderRight: '1px solid #2d2d2d',
              borderBottom: '1px solid #2d2d2d'
            }}>
              <div>
                <span style={{ color: '#aaa', fontSize: '12px', uppercase: 'true', letterSpacing: '1px' }}>
                  🗓️ TANGGAL OPERASIONAL
                </span>
                <h3 style={{ color: '#fff', margin: '5px 0 0 0', fontSize: '18px', fontWeight: '600' }}>
                  {formatTanggal(time)}
                </h3>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#aaa', fontSize: '12px', letterSpacing: '1px' }}>
                  ⏰ WAKTU DIGITAL
                </span>
                <h2 style={{ 
                  color: '#FF9057', 
                  margin: '5px 0 0 0', 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  fontFamily: 'monospace' // Biar angka jamnya anteng pas detiknya berubah
                }}>
                  {formatJam(time)}
                </h2>
              </div>
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
                <div className="dashboard-double-column" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
                  
                  {/* Mini Live Order */}
                  <div className="mini-card-panel" style={{background: '#1e1e1e', padding: '20px', borderRadius: '12px'}}>
                    <h3>🛎️ Pesanan Terbaru</h3>
                    <ul style={{listStyle: 'none', padding: 0, marginTop: '10px'}}>
                      {orders.slice(-5).reverse().map(o => {
                        const nama = o.nama_pemesan || o.nama_user || '';
                        return (
                        <li key={o.id_order} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333'}}>
                          <span>
                            <strong style={{color: '#FF9057'}}>{o.kode_order}</strong>
                            {nama && <small style={{color: '#aaa', marginLeft: '6px'}}>({nama})</small>}
                            <br />
                            <small style={{color: '#888'}}>{o.tipe_layanan === 'dine_in' ? '🍽️ Makan Di Sini' : '📦 Bawa Pulang'}</small>
                          </span>
                          <strong style={{color: 'var(--accent-color)'}}>{formatRp(o.total_tagihan)}</strong>
                        </li>
                      );})}
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
                  <div className="mini-card-panel" style={{background: '#1e1e1e', padding: '20px', borderRadius: '12px'}}>
                    <h3>🔥 Menu Terlaris (Leaderboard)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                      {menuTerlaris.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '20px', background: '#2d2d2d', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.emoji}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{item.nama}</div>
                            <div style={{ fontSize: '11px', color: '#888' }}>{item.terjual} Porsi Terjual</div>
                          </div>
                          <span style={{ fontSize: '13px', color: '#FF9057', fontWeight: 'bold' }}>{formatRp(item.harga)}</span>
                        </div>
                      ))}
                    </div>
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
                        <th>Pelanggan</th>
                        <th>Tipe Layanan</th>
                        <th>Total Tagihan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => {
                        const isPaid = transaksi.some(t => t.id_order === o.id_order);
                        const nama = o.nama_pemesan || o.nama_user || '(Tanpa Nama)';
                        return (
                          <tr key={o.id_order}>
                            <td><strong style={{color: '#FF9057'}}>{o.kode_order}</strong></td>
                            <td><span style={{fontWeight: 600}}>{nama}</span></td>
                            <td>
                              <span className={`badge ${o.tipe_layanan}`}>
                                {o.tipe_layanan === 'dine_in' ? '🍽️ Dine In' : '📦 Take Away'}
                              </span>
                            </td>
                            <td><strong>{formatRp(o.total_tagihan)}</strong></td>
                            <td>
                              {o.status === 'selesai' ? (
                                <span style={{
                                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                                  background: 'rgba(45, 212, 160, 0.2)', color: '#2DD4A0', border: '1px solid #2DD4A0'
                                }}>
                                  ✓ Lunas
                                </span>
                              ) : (
                                <button
                                  onClick={() => setModalBayar(o.id_order)}
                                  style={{
                                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                                    background: '#FF9057', color: '#fff', border: 'none',
                                    cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                  }}
                                >
                                  ⏳ Proses Bayar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr><td colSpan="5" style={{textAlign:'center', color:'#666'}}>Belum ada pesanan masuk.</td></tr>
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
                      <th>Gambar</th>
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
                          <td>
                            {m.gambar ? (
                              <img src={`${UPLOADS_URL}/${m.gambar}`} alt={m.nama_menu}
                                style={{width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover'}}
                              />
                            ) : (
                              <span style={{color: 'var(--muted)', fontSize: '11px'}}>—</span>
                            )}
                          </td>
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
                <label>Gambar Menu</label>
                <div className="upload-area" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  {(gambarPreview || form.gambar) && (
                    <img
                      src={gambarPreview || (form.gambar ? `${UPLOADS_URL}/${form.gambar}` : null)}
                      alt="Preview"
                      style={{width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)'}}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setGambarFile(file);
                        setGambarPreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)', color: 'var(--muted2)', padding: '8px',
                      fontSize: '12px', flex: 1
                    }}
                  />
                </div>
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
      {toast && (
        <div className="toast-notification" onClick={() => setToast(null)}>
          <div className="toast-icon">🛎️</div>
          <div className="toast-body">
            <div className="toast-title">Pesanan Baru Masuk!</div>
            <div className="toast-desc">Kode: <strong>{toast.kode}</strong>{toast.nama ? ` — ${toast.nama}` : ''}</div>
            <div className="toast-sub">{formatRp(toast.total)} • Segera cek dapur</div>
          </div>
          <button className="toast-close">✕</button>
        </div>
      )}

      {modalBayar && (
        <div className="modal-overlay" onClick={() => setModalBayar(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Pilih Metode Pembayaran</h3>
            <select
              value={metodeBayar}
              onChange={(e) => setMetodeBayar(e.target.value)}
              style={{ width: '100%', padding: '10px', margin: '20px 0' }}
            >
              <option value="cash">Cash</option>
              <option value="qris">QRIS</option>
              <option value="transfer">Transfer</option>
            </select>
            <div className="modal-footer">
              <button onClick={() => setModalBayar(null)}>Batal</button>
              <button onClick={submitBayar} className="btn-primary">Konfirmasi</button>
            </div>
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