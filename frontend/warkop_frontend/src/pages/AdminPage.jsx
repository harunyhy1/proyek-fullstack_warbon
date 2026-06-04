import { useState, useEffect } from 'react';
import { getMenu, getKategori, createMenu, updateMenu, deleteMenu } from '../api';

function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function AdminPage() {
  const [tab, setTab]         = useState('dashboard'); // 'dashboard' | 'menu' | 'kategori'
  const [menu, setMenu]       = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  // Modal state
  const [modal, setModal]     = useState(null);  // null | 'add' | 'edit'
  const [form, setForm]       = useState({ id_kategori: '', nama_menu: '', harga: '' });
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [m, k] = await Promise.all([getMenu(), getKategori()]);
      setMenu(m.data || []);
      setKategori(k.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

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

  // ── Stats untuk dashboard ──
  const totalMenu    = menu.length;
  const totalKategori= kategori.length;
  const hargaRataRata= menu.length ? Math.round(menu.reduce((s,m) => s + m.harga, 0) / menu.length) : 0;
  const hargaTertinggi = menu.length ? Math.max(...menu.map(m => m.harga)) : 0;

  return (
    <div className="admin-page">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span>☕</span>
          <div>
            <div className="brand-name">Warkop Admin</div>
            <div className="brand-sub">Panel Pengelola</div>
          </div>
        </div>
        <nav>
          {[
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'menu',      icon: '🍽️', label: 'Kelola Menu' },
            { key: 'kategori',  icon: '🏷️', label: 'Kategori' },
          ].map(n => (
            <button
              key={n.key}
              className={`sidebar-nav ${tab === n.key ? 'active' : ''}`}
              onClick={() => setTab(n.key)}
            >
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <div className="admin-main">

        {/* ── Dashboard Tab ── */}
        {tab === 'dashboard' && (
          <>
            <div className="admin-header">
              <h1>Dashboard</h1>
              <p>Ringkasan data Warkop Digital</p>
            </div>
            {loading ? <Spinner /> : (
              <>
                <div className="stat-grid">
                  <StatCard icon="🍽️" label="Total Menu"    value={totalMenu}           color="#6C63FF" />
                  <StatCard icon="🏷️" label="Kategori"      value={totalKategori}        color="#2DD4A0" />
                  <StatCard icon="💰" label="Harga Rata-rata" value={formatRp(hargaRataRata)} color="#FF9057" />
                  <StatCard icon="🏆" label="Harga Tertinggi" value={formatRp(hargaTertinggi)} color="#FFD166" />
                </div>

                <div className="admin-section-title">Semua Menu</div>
                <div className="admin-menu-grid">
                  {menu.slice(0, 8).map(m => {
                    const kat = kategori.find(k => k.id_kategori === m.id_kategori);
                    return (
                      <div key={m.id_menu} className="admin-menu-card">
                        <div className="amc-top">
                          <span className="amc-id">#{m.id_menu}</span>
                          <span className="amc-kat">{kat?.nama_kategori || '—'}</span>
                        </div>
                        <div className="amc-name">{m.nama_menu}</div>
                        <div className="amc-price">{formatRp(m.harga)}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Menu Tab ── */}
        {tab === 'menu' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Kelola Menu</h1>
                <p>{menu.length} item menu terdaftar</p>
              </div>
              <button className="btn-primary" onClick={openAdd}>+ Tambah Menu</button>
            </div>
            {err && <div className="err-box">{err}</div>}
            {loading ? <Spinner /> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nama Menu</th>
                      <th>Kategori</th>
                      <th>Harga</th>
                      <th>Ditambahkan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map(m => {
                      const kat = kategori.find(k => k.id_kategori === m.id_kategori);
                      const tgl = new Date(m.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
                      return (
                        <tr key={m.id_menu}>
                          <td><span className="tbl-id">#{m.id_menu}</span></td>
                          <td><strong>{m.nama_menu}</strong></td>
                          <td><span className="tbl-kat">{kat?.nama_kategori || '—'}</span></td>
                          <td><span className="tbl-price">{formatRp(m.harga)}</span></td>
                          <td style={{ color: 'var(--muted)' }}>{tgl}</td>
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

        {/* ── Kategori Tab ── */}
        {tab === 'kategori' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Kategori</h1>
                <p>{kategori.length} kategori terdaftar</p>
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
                      <div className="kac-count">{count} menu</div>
                    </div>
                  );
                })}
                {kategori.length === 0 && (
                  <div className="empty-state">Belum ada kategori</div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal Tambah/Edit Menu ── */}
      {modal === 'menu' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2>{editId ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="field">
                <label>Nama Menu</label>
                <input
                  type="text"
                  placeholder="contoh: Kopi Susu Gula Aren"
                  value={form.nama_menu}
                  onChange={e => setForm(f => ({ ...f, nama_menu: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Harga (Rp)</label>
                <input
                  type="number"
                  placeholder="contoh: 15000"
                  value={form.harga}
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
              {err && <div className="err-box">{err}</div>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="sc-icon">{icon}</div>
      <div className="sc-val">{value}</div>
      <div className="sc-label">{label}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p>Memuat data...</p>
    </div>
  );
}
