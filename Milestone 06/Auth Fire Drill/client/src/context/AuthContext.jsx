
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const getUserFromToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);

    if (!decoded.userId || !decoded.role) {
      return null;
    }

    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      return null;
    }

    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => getUserFromToken(localStorage.getItem('token')));

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    const nextUser = getUserFromToken(token);

    if (!nextUser) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      return;
    }

    setUser(nextUser);
  }, [token]);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(getUserFromToken(data.token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role || null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
