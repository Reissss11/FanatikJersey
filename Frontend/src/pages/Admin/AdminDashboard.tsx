import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaCogs } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard-container">
            <div className="admin-welcome">
                <h1>Bem-vindo, {user?.username || 'Admin'}!</h1>
                <p>O que pretendes fazer hoje?</p>
            </div>

            <div className="admin-actions-grid">
                <button className="admin-action-card" onClick={() => navigate('/')}>
                    <FaUser className="action-icon" />
                    <h2>Ver Loja</h2>
                    <p>Navegar no site como um utilizador normal</p>
                </button>

                <button className="admin-action-card primary" onClick={() => navigate('/admin/panel')}>
                    <FaCogs className="action-icon" />
                    <h2>Painel de Admin</h2>
                    <p>Gerir produtos, utilizadores e configurações</p>
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
