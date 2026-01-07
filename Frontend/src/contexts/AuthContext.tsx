import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/auth.service';

interface User {
    sub: string; // email
    username: string;
}

// NOTE: To get username, we would ideally change backend to include 'username' in token
// or fetch /me. Since I can't easily change backend token structure without risk,
// I will try to use the email part or just 'User' for now, OR fetch profile.
// Actually, I can simulate fetching profile or just use what decodes.

interface AuthContextType {
    user: any | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = authService.getCurrentUser();
        if (token) {
            try {
                const decoded = jwtDecode(token) as User;
                setUser(decoded);
            } catch (error) {
                console.error("Invalid token", error);
                authService.logout();
            }
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token) as User;
        setUser(decoded);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
