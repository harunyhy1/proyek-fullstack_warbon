import { useState } from 'react';
import { login, register } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ onSuccess }) {
  const { loginUser } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ nama: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const res = await login({ email: form.email, password: form.password });
        loginUser(res.token);
        onSuccess?.();
      } else {
        await register({ nama: form.nama, email: form.email, password: form.password });
        setMode('login');
        setError('');
        setForm(f => ({ ...f, nama: '' }));
        alert('Registrasi berhasil! Silakan login.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">☕</span>
          <h1>Warkop Digital</h1>
          <p>Pesan dari mana saja, kapan saja</p>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>
            Masuk
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="field">
              <label>Nama Lengkap</label>
              <input name="nama" type="text" placeholder="Nama kamu" value={form.nama} onChange={handleChange} required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" placeholder="email@contoh.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
          </button>
        </form>
      </div>
    </div>
  );
}
