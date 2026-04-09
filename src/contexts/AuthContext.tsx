import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "user";

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const TEST_CREDENTIALS: Record<string, { password: string; user: User }> = {
  "admin@test.com": {
    password: "admin123",
    user: { email: "admin@test.com", name: "Admin", role: "admin" },
  },
  "user@test.com": {
    password: "user123",
    user: { email: "user@test.com", name: "Rahul", role: "user" },
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  const login = (email: string, password: string): boolean => {
    const cred = TEST_CREDENTIALS[email.toLowerCase()];
    if (cred && cred.password === password) {
      setUser(cred.user);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};
