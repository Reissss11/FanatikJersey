import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { catalogService, type Jersey } from '../../services/catalog.service';
import { FaShoppingCart } from 'react-icons/fa';
import UserDropdown from './UserDropdown';
import CartDrawer from '../Cart/CartDrawer';
import LogoPreto from '../../assets/Logos/LogoPreto.png';
import './Header.css';

const Header = () => {
    const { isAuthenticated, user } = useAuth();
    const { toggleCart, totalItems } = useCart();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Jersey[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                try {
                    const response = await catalogService.getJerseys({ search: searchQuery }, { limit: 5 });
                    setSearchResults(response.data);
                    setShowResults(true);
                } catch (error) {
                    console.error("Error searching:", error);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowResults(false);
        if (searchQuery.trim()) {
            navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-container">
                    <Link to={user?.role === 'admin' ? "/admin" : "/"}>
                        <img
                            src={LogoPreto}
                            alt="FanatikJersey Logo"
                            className="logo"
                        />
                    </Link>
                </div>

                <div className="search-container" ref={searchRef}>
                    <Link to="/catalog" className="filter-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14"></line>
                            <line x1="4" y1="10" x2="4" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12" y2="3"></line>
                            <line x1="20" y1="21" x2="20" y2="16"></line>
                            <line x1="20" y1="12" x2="20" y2="3"></line>
                            <line x1="1" y1="14" x2="7" y2="14"></line>
                            <line x1="9" y1="8" x2="15" y2="8"></line>
                            <line x1="17" y1="16" x2="23" y2="16"></line>
                        </svg>
                        <span>Ver Todas</span>
                    </Link>
                    <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
                        <form onSubmit={handleSearchSubmit} className="search-form">
                            <input
                                type="text"
                                name="search"
                                placeholder="Procurar camisolas..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                autoComplete="off"
                            />
                            <button type="submit" className="search-submit">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </form>

                        {/* Live Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="search-results-dropdown">
                                {searchResults.map(jersey => (
                                    <Link
                                        to={`/jerseys/${jersey.id}`}
                                        key={jersey.id}
                                        className="search-result-item"
                                        onClick={() => setShowResults(false)}
                                    >
                                        <div className="result-image">
                                            {jersey.images?.[0] ? (
                                                <img src={jersey.images[0].image_base64} alt={jersey.team_name} />
                                            ) : (
                                                <div className="result-no-image">No Img</div>
                                            )}
                                        </div>
                                        <div className="result-info">
                                            <span className="result-name">{jersey.team_name}</span>
                                            <span className="result-meta">{jersey.season} - {jersey.jersey_type?.name}</span>
                                        </div>
                                        <span className="result-price">
                                            {jersey.jersey_type?.current_price} €
                                        </span>
                                    </Link>
                                ))}
                                <Link to={`/catalog?search=${encodeURIComponent(searchQuery)}`} className="view-all-results" onClick={() => setShowResults(false)}>
                                    Ver todos os resultados
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="actions">
                    {isAuthenticated ? (
                        <UserDropdown />
                    ) : (
                        <Link to="/login">
                            <button className="login-btn">Login/Registro</button>
                        </Link>
                    )}
                    <button className="cart-btn" aria-label="Carrinho" onClick={toggleCart}>
                        <FaShoppingCart />
                        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                    </button>
                </div>
            </div>
            <CartDrawer />
        </header>
    );
};

export default Header;
