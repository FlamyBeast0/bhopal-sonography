
import React, { createContext, useState, ReactNode, useContext } from 'react';
import { User, UserRole } from '../services/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const STORAGE_USER_KEY = 'bhopalSonographyCenterUser';

// MOCK CLOUD USER DATABASE
const MOCK_USERS = [
    { email: 'admin@bsc.com', password: 'admin123', name: 'Dr. Admin', role: UserRole.Admin },
    { email: 'staff@bsc.com', password: 'staff123', name: 'Front Desk', role: UserRole.Employee }
];

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, pass: string) => {
    // SIMULATING CLOUD LATENCY
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === pass);

    if (foundUser) {
      const userData: User = {
        id: Date.now().toString(),
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
      };
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      setUser(userData);
    } else {
        throw new Error("Invalid credentials. Try 'admin@bsc.com' or 'staff@bsc.com'");
    }
  };

  const loginAsGuest = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const guestUser: User = {
        id: 'guest',
        email: 'guest@demo.com',
        name: 'Showcase Guest',
        role: UserRole.Admin,
    };
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
