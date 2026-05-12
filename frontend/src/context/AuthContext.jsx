import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token exists, load user info
    if (token) {
      try {
        // Simple JWT decode to grab user object mapping (if backend packed it in token)
        // For production, this should hit a `/api/auth/me` endpoint to validate the token.
        const decodedString = atob(token.split('.')[1]);
        const decodedData = JSON.parse(decodedString);
        setUser({ id: decodedData.id, role: decodedData.role, name: decodedData.name });
      } catch (err) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
