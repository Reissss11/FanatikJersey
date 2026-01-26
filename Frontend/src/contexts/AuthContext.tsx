import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/auth.service';

interface User {
    sub: string; // email
    username: string;
    role?: 'user' | 'admin';
}

interface AuthContextType {
    user: any | null;
    profileImage: string | null;
    login: (token: string) => Promise<any>;
    logout: () => void;
    updateProfileImage: (image: string | null) => void;
    refreshUser: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserProfile = async () => {
        try {
            // Dynamic import to avoid circular dependency
            const { profileService } = await import('../services/profile.service');
            const data = await profileService.getProfile();

            // Update profile image
            if (data.user_images && data.user_images.length > 0) {
                setProfileImage(data.user_images[data.user_images.length - 1].image_data);
            }

            // Update user info (sync username if changed)
            setUser(prev => {
                if (!prev) return null;
                return { ...prev, username: data.username, sub: data.email, role: data.role };
            });
            return data;

        } catch (error) {
            console.error("Failed to fetch user profile", error);
            return null;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = authService.getCurrentUser();
            if (token) {
                try {
                    const decoded = jwtDecode(token) as User;
                    setUser(decoded);
                    // Fetch latest profile data (image + updated username)
                    await fetchUserProfile();
                } catch (error) {
                    console.error("Invalid token", error);
                    authService.logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token) as User;
        setUser(decoded);
        return await fetchUserProfile();
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setProfileImage(null);
    };

    const updateProfileImage = (image: string | null) => {
        setProfileImage(image);
    };

    const refreshUser = () => {
        fetchUserProfile();
    };

    return (
        <AuthContext.Provider value={{ user, profileImage, login, logout, updateProfileImage, refreshUser, isAuthenticated: !!user, isLoading }}>
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
