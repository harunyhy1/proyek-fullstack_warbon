import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function DashNavbar({ page, setPage, onShowAuth }) {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNavClick(p) {
    setPage(p);
    setMenuOpen(false);
  }

  function handleAuthClick() {
    onShowAuth();
    setMenuOpen(false);
  }

  return (
    <nav className="dash-navbar">
      <div className="nav-brand" onClick={() => setPage('menu')} style={{ cursor: 'pointer' }}>
        <span className="nav-logo">☕</span>
        <div>
          <div className="nav-title">Warkop Sibontot</div>
          <div className="nav-sub">Online Ordering System</div>
        </div>
      </div>

      <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
        <span className={`hamb-line ${menuOpen ? 'open' : ''}`} />
      </button>

      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="nav-links">
          <button
            className={`nav-link ${page === 'menu' ? 'active' : ''}`}
            onClick={() => handleNavClick('menu')}
          >Menu</button>
          {isAdmin && (
            <button
              className={`nav-link ${page === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
            >Admin Panel</button>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              <div className="nav-avatar">{user.role === 'admin' ? '👑' : '👤'}</div>
              <div className="nav-user-info">
                <span className="nav-role">{user.role}</span>
              </div>
              <button className="nav-logout" onClick={() => { logout(); setMenuOpen(false); }}>Keluar</button>
            </div>
          ) : (
            <button className="nav-login-btn" onClick={handleAuthClick}>Masuk / Daftar</button>
          )}
        </div>
      </div>
    </nav>
  );
}
