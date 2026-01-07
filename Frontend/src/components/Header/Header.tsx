import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import UserDropdown from './UserDropdown';
import LogoBranco from '../../assets/Logos/LogoBranco.png';
import LogoPreto from '../../assets/Logos/LogoPreto.png';
import './Header.css';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated } = useAuth();

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-container">
                    <img
                        src={theme === 'dark' ? LogoBranco : LogoPreto}
                        alt="FanatikJersey Logo"
                        className="logo"
                    />
                </div>

                <nav className="nav">
                    <ul className="nav-list">
                        <li><a href="#" className="nav-link">Camisolas</a></li>
                    </ul>
                </nav>

                <div className="actions">
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    {isAuthenticated ? (
                        <UserDropdown />
                    ) : (
                        <Link to="/login">
                            <button className="login-btn">Login/Registro</button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
