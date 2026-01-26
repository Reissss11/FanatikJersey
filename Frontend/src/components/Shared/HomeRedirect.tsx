import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Home from '../../pages/Home/Home';

const HomeRedirect = () => {
    const { user, isLoading } = useAuth();
    const [searchParams] = useSearchParams();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>A carregar...</div>;
    }

    if (user?.role === 'admin' && searchParams.get('view') !== 'user') {
        return <Navigate to="/admin" replace />;
    }

    return <Home />;
};

export default HomeRedirect;
