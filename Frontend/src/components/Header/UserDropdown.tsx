import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './UserDropdown.css';

const UserDropdown = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    // The token currently has 'username' which is what we want.
    const displayName = user?.username || 'User';

    return (
        <div className="user-dropdown-container" ref={dropdownRef}>
            <button
                className="user-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="user-name">{displayName}</span>
                <span className="arrow">▼</span>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <span className="user-email">{user?.sub}</span>
                    </div>
                    <ul className="dropdown-list">
                        <li>
                            <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
                                Perfil
                            </Link>
                        </li>
                        <li className="divider"></li>
                        <li>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                Terminar Sessão
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
