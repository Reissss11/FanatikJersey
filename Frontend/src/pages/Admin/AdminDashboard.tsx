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
                <button className="admin-action-card" onClick={() => navigate('/?view=user')}>
                    <FaUser className="action-icon" />
                    <h2>Ver Loja</h2>
                    <p>Navegar no site como um utilizador normal</p>
                </button>

                <button className="admin-action-card primary" onClick={() => navigate('/admin/leagues')}>
                    <FaCogs className="action-icon" />
                    <h2>Gerir Ligas</h2>
                    <p>Adicionar e editar ligas</p>
                </button>

                <button className="admin-action-card primary" onClick={() => navigate('/admin/teams')}>
                    <FaCogs className="action-icon" />
                    <h2>Gerir Clubes</h2>
                    <p>Adicionar e editar clubes</p>
                </button>

                <button className="admin-action-card primary" onClick={() => navigate('/admin/jerseys')}>
                    <FaCogs className="action-icon" />
                    <h2>Gerir Camisolas</h2>
                    <p>Adicionar camisolas e imagens</p>
                </button>

                <button className="admin-action-card primary" onClick={() => navigate('/admin/pricing')}>
                    <FaCogs className="action-icon" />
                    <h2>Gerir Preços / Tipos</h2>
                    <p>Definir preços por tipo de camisola</p>
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
