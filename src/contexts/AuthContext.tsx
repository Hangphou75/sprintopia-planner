import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type UserRole = "athlete" | "coach";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    // Mock login - replace with real authentication
    const mockUser: User = {
      id: "550e8400-e29b-41d4-a716-446655440000", // Using a proper UUID format
      name: "John Doe",
      email,
      role,
    };
    
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
    navigate(`/${role}/home`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}