import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ page, setPage, onShowAuth }) {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setPage('menu')} style={{ cursor: 'pointer' }}>
        <span className="nav-logo">☕</span>
        <div>
          <div className="nav-title">Warkop Sibontot</div>
          <div className="nav-sub">Online Ordering System</div>
        </div>
      </div>

      <div className="nav-links">
        <button
          className={`nav-link ${page === 'menu' ? 'active' : ''}`}
          onClick={() => setPage('menu')}
        >Menu</button>
        {isAdmin && (
          <button
            className={`nav-link ${page === 'admin' ? 'active' : ''}`}
            onClick={() => setPage('admin')}
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
            <button className="nav-logout" onClick={logout}>Keluar</button>
          </div>
        ) : (
          <button className="nav-login-btn" onClick={onShowAuth}>Masuk / Daftar</button>
        )}
      </div>
    </nav>
  );
}
