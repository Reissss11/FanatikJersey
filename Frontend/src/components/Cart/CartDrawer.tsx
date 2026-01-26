import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { FaTimes, FaTrash, FaShoppingBag } from 'react-icons/fa';
import './CartDrawer.css';

const CartDrawer = () => {
    const {
        isCartOpen,
        toggleCart,
        items,
        removeFromCart,
        subtotal,
        discountPerItem,
        totalDiscount,
        finalTotal,
        totalItems
    } = useCart();
    const { isAuthenticated } = useAuth();

    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isCartOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                // Check if click was on the toggle button (optional, but usually handled by overlay)
                toggleCart();
            }
        };

        if (isCartOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen, toggleCart]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price);
    };

    if (!isCartOpen) return null;

    return (
        <div className="cart-overlay">
            <div className="cart-drawer" ref={drawerRef}>
                <div className="cart-header">
                    <h2>Carrinho ({totalItems})</h2>
                    <button onClick={toggleCart} className="close-btn" aria-label="Fechar carrinho">
                        <FaTimes />
                    </button>
                </div>

                <div className="cart-items">
                    {items.length === 0 ? (
                        <div className="empty-cart">
                            <FaShoppingBag className="empty-icon" />
                            <p>O seu carrinho está vazio</p>
                            <button onClick={toggleCart} className="start-shopping-btn">Começar a comprar</button>
                        </div>
                    ) : (
                        items.map((item, index) => {
                            const mainImage = item.jersey.images.find(img => img.is_main) || item.jersey.images[0];
                            return (
                                <div key={`${item.jersey.id}-${item.size}-${index}`} className="cart-item">
                                    <div className="cart-item-image">
                                        {mainImage && (
                                            <img src={mainImage.image_base64} alt={item.jersey.team_name} />
                                        )}
                                    </div>
                                    <div className="cart-item-info">
                                        <h4>{item.jersey.team_name}</h4>
                                        <p className="item-meta">{item.jersey.season} | {item.size}</p>

                                        {(item.customName || item.customNumber) && (
                                            <p className="item-customization">
                                                Personalização: {item.customName} {item.customNumber} (+3.00€)
                                            </p>
                                        )}
                                        {item.patches && item.patches.length > 0 && (
                                            <div className="item-patches-list">
                                                {item.patches.map((patch, i) => (
                                                    <span key={i} className="item-patch">
                                                        {patch} (+2.00€)
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="item-price-row">
                                            <span className="item-price">
                                                {formatPrice(item.finalPrice)}
                                            </span>
                                            {item.quantity > 1 && (
                                                <span className="item-quantity">x{item.quantity}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.jersey.id || 0, item.size, item.customName, item.customNumber, item.patches)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-footer">
                        {totalItems >= 3 && (
                            <div className="discount-message">
                                🎉 Desconto aplicado: -{discountPerItem}€ por artigo!
                            </div>
                        )}

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="summary-row discount">
                                <span>Desconto ({totalItems} items)</span>
                                <span>-{formatPrice(totalDiscount)}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatPrice(finalTotal)}</span>
                        </div>

                        {isAuthenticated ? (
                            <Link to="/checkout" onClick={toggleCart} className="checkout-link">
                                <button className="checkout-btn">
                                    Finalizar Compra
                                </button>
                            </Link>
                        ) : (
                            <Link to="/login" onClick={toggleCart}>
                                <button className="checkout-btn login-required-btn">
                                    Login para Finalizar
                                </button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
