import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar    from './components/Navbar';
import MenuPage  from './pages/MenuPage';
import AdminPage from './pages/AdminPage';
import AuthPage  from './pages/AuthPage';
import './App.css';

function AppInner() {
  const { user, isAdmin } = useAuth();
  const [page, setPage]     = useState('menu');
  const [showAuth, setShowAuth] = useState(false);

  function handleAuthSuccess() {
    setShowAuth(false);
  }

  // Kalau admin buka halaman menu, tetap bisa; kalau buka admin, cek dulu
  const currentPage = (page === 'admin' && !isAdmin) ? 'menu' : page;

  return (
    <div className="app">
      <Navbar
        page={currentPage}
        setPage={setPage}
        onShowAuth={() => setShowAuth(true)}
      />

      <main className="app-main">
        {currentPage === 'menu'  && <MenuPage  onShowAuth={() => setShowAuth(true)} />}
        {currentPage === 'admin' && <AdminPage />}
      </main>

      {showAuth && (
        <AuthPage onSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </AuthProvider>
  );
}
