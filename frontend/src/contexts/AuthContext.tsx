import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// interface for User
interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
// interface for AuthContextType
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

// check if token is in local storage
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // verify token by getting user profile
      axios.get('http://localhost:3001/api/users/profile')
        .then(response => {
          if (response.data.role === 'ADMIN') {
            setUser(response.data);
          } else {
            localStorage.removeItem('adminToken');
            delete axios.defaults.headers.common['Authorization'];
          }
        })
        .catch(() => {
          localStorage.removeItem('adminToken');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

// login function
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3001/api/users/login', {
        email,
        password
      });

// get token and user data from response
      const { token, user: userData } = response.data;
      if (userData.role !== 'ADMIN') {
        throw new Error('Access denied. Admin role required.');
      }
// set token and user data in local storage
      localStorage.setItem('adminToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };
// logout function
  const logout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
// value object
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 