import { useState, useEffect } from 'react';
import { getMenu, getKategori, createOrder, bayar } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function MenuPage({ onShowAuth }) {
  const { user } = useAuth();
  const { items, addItem, removeItem, updateQty, clearCart, total, itemCount } = useCart();

  const [menu, setMenu]         = useState([]);
  const [kategori, setKategori] = useState([]);
  const [activeKat, setActiveKat] = useState('semua');
  const [loading, setLoading]   = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep]         = useState('cart');   // 'cart' | 'tipe' | 'bayar' | 'sukses'
  const [tipeLayanan, setTipeLayanan] = useState('dine_in');
  const [metodeBayar, setMetodeBayar] = useState('cash');
  const [orderResult, setOrderResult] = useState(null);
  const [transaksiResult, setTransaksiResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [err, setErr]            = useState('');

  useEffect(() => {
    Promise.all([getMenu(), getKategori()])
      .then(([m, k]) => {
        setMenu(m.data || []);
        setKategori(k.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeKat === 'semua'
    ? menu
    : menu.filter(m => m.id_kategori === activeKat);

  async function handleOrder() {
    if (!user) { onShowAuth?.(); return; }
    if (items.length === 0) return;
    setProcessing(true);
    setErr('');
    try {
      const res = await createOrder({
        tipe_layanan: tipeLayanan,
        items: items.map(i => ({ id_menu: i.id_menu, jumlah: i.jumlah })),
      });
      setOrderResult(res.data);
      setStep('bayar');
    } catch (e) {
      setErr(e.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleBayar() {
    setProcessing(true);
    setErr('');
    try {
      const res = await bayar({ id_order: orderResult.id_order, metode_pembayaran: metodeBayar });
      setTransaksiResult(res.data);
      setStep('sukses');
      clearCart();
    } catch (e) {
      setErr(e.message);
    } finally {
      setProcessing(false);
    }
  }

  function resetCart() {
    setCartOpen(false);
    setStep('cart');
    setOrderResult(null);
    setTransaksiResult(null);
    setErr('');
  }

  return (
    <div className="menu-page">
      {/* ── Kategori filter ── */}
      <div className="kat-bar">
        <button
          className={activeKat === 'semua' ? 'kat-btn active' : 'kat-btn'}
          onClick={() => setActiveKat('semua')}
        >Semua</button>
        {kategori.map(k => (
          <button
            key={k.id_kategori}
            className={activeKat === k.id_kategori ? 'kat-btn active' : 'kat-btn'}
            onClick={() => setActiveKat(k.id_kategori)}
          >{k.nama_kategori}</button>
        ))}
      </div>

      {/* ── Menu grid ── */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Memuat menu...</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filtered.map(m => {
            const inCart = items.find(i => i.id_menu === m.id_menu);
            return (
              <div key={m.id_menu} className="menu-card">
                <div className="menu-img">{getCategoryEmoji(m.id_kategori, kategori)}</div>
                <div className="menu-body">
                  <h3>{m.nama_menu}</h3>
                  <span className="menu-price">{formatRp(m.harga)}</span>
                  {inCart ? (
                    <div className="qty-ctrl">
                      <button onClick={() => updateQty(m.id_menu, inCart.jumlah - 1)}>−</button>
                      <span>{inCart.jumlah}</span>
                      <button onClick={() => updateQty(m.id_menu, inCart.jumlah + 1)}>+</button>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => addItem(m)}>+ Tambah</button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="empty-state">Menu belum tersedia di kategori ini</div>
          )}
        </div>
      )}

      {/* ── Floating Cart Button ── */}
      {itemCount > 0 && (
        <button className="cart-fab" onClick={() => { setCartOpen(true); setStep('cart'); }}>
          🛒 {itemCount} item · {formatRp(total)}
        </button>
      )}

      {/* ── Cart / Checkout Drawer ── */}
      {cartOpen && (
        <div className="drawer-overlay" onClick={() => !processing && resetCart()}>
          <div className="drawer" onClick={e => e.stopPropagation()}>

            {step === 'cart' && (
              <>
                <div className="drawer-hdr">
                  <h2>🛒 Keranjang</h2>
                  <button className="close-btn" onClick={resetCart}>✕</button>
                </div>
                <div className="cart-items">
                  {items.map(i => (
                    <div key={i.id_menu} className="cart-row">
                      <div className="cart-info">
                        <span className="cart-name">{i.nama_menu}</span>
                        <span className="cart-price">{formatRp(i.harga)}</span>
                      </div>
                      <div className="qty-ctrl">
                        <button onClick={() => updateQty(i.id_menu, i.jumlah - 1)}>−</button>
                        <span>{i.jumlah}</span>
                        <button onClick={() => updateQty(i.id_menu, i.jumlah + 1)}>+</button>
                      </div>
                      <span className="cart-sub">{formatRp(i.harga * i.jumlah)}</span>
                    </div>
                  ))}
                </div>
                <div className="drawer-footer">
                  <div className="total-row"><span>Total</span><strong>{formatRp(total)}</strong></div>
                  <button className="checkout-btn" onClick={() => setStep('tipe')}>Lanjut Pesan →</button>
                </div>
              </>
            )}

            {step === 'tipe' && (
              <>
                <div className="drawer-hdr">
                  <button className="back-btn" onClick={() => setStep('cart')}>← Kembali</button>
                  <h2>Tipe Layanan</h2>
                </div>
                <div className="tipe-options">
                  {[
                    { val: 'dine_in',   icon: '🍽️', label: 'Makan di Sini', desc: 'Nikmati di tempat' },
                    { val: 'take_away', icon: '📦', label: 'Bawa Pulang',   desc: 'Dikemas untuk dibawa' },
                  ].map(t => (
                    <div
                      key={t.val}
                      className={`tipe-card ${tipeLayanan === t.val ? 'selected' : ''}`}
                      onClick={() => setTipeLayanan(t.val)}
                    >
                      <span className="tipe-icon">{t.icon}</span>
                      <div><strong>{t.label}</strong><p>{t.desc}</p></div>
                      {tipeLayanan === t.val && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
                {err && <div className="err-box">{err}</div>}
                <div className="drawer-footer">
                  <div className="total-row"><span>Total</span><strong>{formatRp(total)}</strong></div>
                  <button className="checkout-btn" onClick={handleOrder} disabled={processing}>
                    {processing ? 'Memproses...' : 'Buat Pesanan →'}
                  </button>
                </div>
              </>
            )}

            {step === 'bayar' && orderResult && (
              <>
                <div className="drawer-hdr">
                  <h2>💳 Pembayaran</h2>
                </div>
                <div className="order-info-box">
                  <div className="order-kode">{orderResult.kode_order}</div>
                  <div className="order-total-lbl">Total Tagihan</div>
                  <div className="order-total-val">{formatRp(orderResult.total_tagihan)}</div>
                </div>
                <div className="metode-list">
                  <p className="metode-label">Pilih Metode Pembayaran</p>
                  {[
                    { val: 'cash',     icon: '💵', label: 'Tunai' },
                    { val: 'transfer', icon: '🏦', label: 'Transfer Bank' },
                    { val: 'qris',     icon: '📱', label: 'QRIS' },
                  ].map(m => (
                    <div
                      key={m.val}
                      className={`metode-card ${metodeBayar === m.val ? 'selected' : ''}`}
                      onClick={() => setMetodeBayar(m.val)}
                    >
                      <span>{m.icon}</span><span>{m.label}</span>
                      {metodeBayar === m.val && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
                {err && <div className="err-box">{err}</div>}
                <div className="drawer-footer">
                  <button className="checkout-btn" onClick={handleBayar} disabled={processing}>
                    {processing ? 'Memproses...' : 'Bayar Sekarang →'}
                  </button>
                </div>
              </>
            )}

            {step === 'sukses' && transaksiResult && (
              <div className="sukses-view">
                <div className="sukses-icon">✅</div>
                <h2>Pembayaran Berhasil!</h2>
                <div className="sukses-detail">
                  <div className="sd-row"><span>No. Transaksi</span><strong>#{transaksiResult.id_transaksi}</strong></div>
                  <div className="sd-row"><span>Metode</span><strong style={{ textTransform:'capitalize' }}>{transaksiResult.metode_pembayaran}</strong></div>
                  <div className="sd-row"><span>Total</span><strong>{formatRp(transaksiResult.total_harga)}</strong></div>
                </div>
                <p className="sukses-msg">Terima kasih! Pesananmu sedang disiapkan ☕</p>
                <button className="checkout-btn" onClick={resetCart}>Pesan Lagi</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: emoji berdasarkan kategori
function getCategoryEmoji(id_kategori, kategoriList) {
  const kat = kategoriList.find(k => k.id_kategori === id_kategori);
  const nm  = kat?.nama_kategori?.toLowerCase() || '';
  if (nm.includes('kopi') || nm.includes('coffee')) return '☕';
  if (nm.includes('minum') || nm.includes('drink'))  return '🥤';
  if (nm.includes('makan') || nm.includes('food'))   return '🍜';
  if (nm.includes('snack') || nm.includes('cemil'))  return '🍟';
  if (nm.includes('dessert') || nm.includes('manis'))return '🍰';
  if (nm.includes('paket'))                           return '🎁';
  return '🍽️';
}
