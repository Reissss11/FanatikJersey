import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ForbiddenPage from '../../pages/Auth/ForbiddenPage';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useAuth();

    // Check if user is authenticated
    if (!isAuthenticated) {
        // According to requirements: "se for um utilizador que não se tenha registado e tentar usar o link ... coloca isso"
        // This means redirecting to forbidden/home with timer instead of login for protected routes like /profile
        // if the user tries to access /profile without being logged in.
        return <ForbiddenPage />;
    }

    // Check for specific role if required
    if (requiredRole && user?.role !== requiredRole) {
        return <ForbiddenPage />;
    }

    return children;
};

export default ProtectedRoute;
