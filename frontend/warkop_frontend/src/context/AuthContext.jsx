import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Decode JWT payload (tanpa library)
  function decodeToken(tok) {
    try {
      const payload = tok.split('.')[1];
      return JSON.parse(atob(payload));
    } catch { return null; }
  }

  function loginUser(tok) {
    const decoded = decodeToken(tok);
    const userData = { id: decoded?.id, role: decoded?.role };
    setToken(tok);
    setUser(userData);
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
