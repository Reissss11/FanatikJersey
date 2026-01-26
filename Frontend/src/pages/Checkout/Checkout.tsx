import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { profileService, type Address } from '../../services/profile.service';
import api from '../../services/api';
import './Checkout.css';
import { FaCreditCard, FaMoneyBillWave, FaMobileAlt, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';

const Checkout = () => {
    const { items, finalTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // States
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
    const [saveNewAddress, setSaveNewAddress] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        shipping_name: '',
        shipping_address: '',
        shipping_city: '',
        shipping_district: '',
        shipping_postal_code: '',
        shipping_country: 'Portugal',
        shipping_phone: '',
        shipping_email: '', // Needed for Guest or just record
        // nif: '', // User requested removal of billing data
    });

    const [paymentMethod, setPaymentMethod] = useState('MBWAY'); // MBWAY, MULTIBANCO, CARD
    const [paymentDetails, setPaymentDetails] = useState(''); // E.g. Phone number for MBWay
    const [policyAccepted, setPolicyAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                try {
                    const profile = await profileService.getProfile();
                    setSavedAddresses(profile.addresses || []);
                    if (profile.addresses && profile.addresses.length > 0) {
                        setSelectedAddressId(profile.addresses[0].id!);
                        fillFormWithAddress(profile.addresses[0]);
                    } else {
                        // Pre-fill name if no address
                        setFormData(prev => ({
                            ...prev,
                            shipping_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                            shipping_email: user.email
                        }));
                    }
                } catch (err) {
                    console.error("Error loading addresses", err);
                }
            }
        };
        loadData();

        // Redirect if empty cart
        if (items.length === 0) {
            navigate('/');
        }
    }, [user, items, navigate]);

    const fillFormWithAddress = (addr: Address) => {
        setFormData({
            shipping_name: `${addr.first_name} ${addr.last_name}`,
            shipping_address: addr.street_address,
            shipping_city: addr.city,
            shipping_district: addr.district,
            shipping_postal_code: addr.postal_code,
            shipping_country: addr.country,
            shipping_phone: addr.phone_number,
            shipping_email: addr.email
        });
    };

    const handleAddressSelection = (id: number | 'new') => {
        setSelectedAddressId(id);
        if (id === 'new') {
            setFormData({
                shipping_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
                shipping_address: '',
                shipping_city: '',
                shipping_district: '',
                shipping_postal_code: '',
                shipping_country: 'Portugal',
                shipping_phone: '',
                shipping_email: user?.email || ''
            });
        } else {
            const addr = savedAddresses.find(a => a.id === id);
            if (addr) fillFormWithAddress(addr);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!policyAccepted) {
            setError('Por favor, aceite a política de não devolução para continuar.');
            return;
        }

        if (paymentMethod === 'MBWAY' && !paymentDetails) {
            setError('Por favor, insira o número de telemóvel para MB Way.');
            return;
        }

        setIsSubmitting(true);


        try {
            // Save address if requested and is new
            if (saveNewAddress && selectedAddressId === 'new' && user) {
                const nameParts = formData.shipping_name.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || '';

                await profileService.addAddress({
                    first_name: firstName,
                    last_name: lastName,
                    street_address: formData.shipping_address,
                    city: formData.shipping_city,
                    postal_code: formData.shipping_postal_code,
                    country: formData.shipping_country,
                    district: formData.shipping_district,
                    phone_number: formData.shipping_phone,
                    email: formData.shipping_email
                });
            }

            const payload = {
                ...formData,
                payment_method: paymentMethod,
                payment_details: JSON.stringify({ phone: paymentDetails }) // Store diverse details as JSON
            };

            await api.post('/orders/', payload);

            // Success
            clearCart();
            alert('Encomenda realizada com sucesso!');
            navigate('/profile'); // Redirect to profile/orders
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Ocorreu um erro ao processar a encomenda.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price);
    };

    return (
        <div className="checkout-container">
            <h1 className="checkout-title">Finalizar Encomenda</h1>

            <form className="checkout-content" onSubmit={handleSubmit}>
                <div className="checkout-form-column">
                    {/* Shipping Section */}
                    <div className="checkout-section">
                        <h2>📍 Endereço de Envio</h2>

                        {/* Saved Addresses List */}
                        {savedAddresses.length > 0 && (
                            <div className="saved-addresses-list">
                                {savedAddresses.map(addr => (
                                    <div
                                        key={addr.id}
                                        className={`saved-address-card ${selectedAddressId === addr.id ? 'active' : ''}`}
                                        onClick={() => handleAddressSelection(addr.id!)}
                                    >
                                        <div className="address-card-header">
                                            <FaMapMarkerAlt />
                                            <strong>{addr.first_name} {addr.last_name}</strong>
                                        </div>
                                        <p>{addr.street_address}</p>
                                        <p>{addr.postal_code}, {addr.city}, {addr.district}</p>
                                    </div>
                                ))}
                                <div
                                    className={`saved-address-card new-option ${selectedAddressId === 'new' ? 'active' : ''}`}
                                    onClick={() => handleAddressSelection('new')}
                                >
                                    <FaPlus />
                                    <strong>Nova Morada</strong>
                                </div>
                            </div>
                        )}

                        {/* Form - Only editable if New usually, but let's allow editing always for Order, but not update profile unless new */}
                        <div className={`address-form-container ${selectedAddressId !== 'new' ? 'read-only-look' : ''}`}>
                            <div className="form-group">
                                <label>Nome Completo</label>
                                <input
                                    type="text"
                                    name="shipping_name"
                                    className="form-input"
                                    value={formData.shipping_name}
                                    onChange={handleInputChange}
                                    required
                                    disabled={selectedAddressId !== 'new'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Morada</label>
                                <input
                                    type="text"
                                    name="shipping_address"
                                    className="form-input"
                                    value={formData.shipping_address}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Rua, Número, Andar"
                                    disabled={selectedAddressId !== 'new'}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Cidade/Região</label>
                                    <input
                                        type="text"
                                        name="shipping_city"
                                        className="form-input"
                                        value={formData.shipping_city}
                                        onChange={handleInputChange}
                                        required
                                        disabled={selectedAddressId !== 'new'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Distrito</label>
                                    <input
                                        type="text"
                                        name="shipping_district"
                                        className="form-input"
                                        value={formData.shipping_district}
                                        onChange={handleInputChange}
                                        required
                                        disabled={selectedAddressId !== 'new'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Código Postal</label>
                                    <input
                                        type="text"
                                        name="shipping_postal_code"
                                        className="form-input"
                                        value={formData.shipping_postal_code}
                                        onChange={handleInputChange}
                                        required
                                        disabled={selectedAddressId !== 'new'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>País</label>
                                    <input
                                        type="text"
                                        name="shipping_country"
                                        className="form-input"
                                        value={formData.shipping_country}
                                        onChange={handleInputChange}
                                        required
                                        disabled={selectedAddressId !== 'new'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telemóvel</label>
                                    <input
                                        type="tel"
                                        name="shipping_phone"
                                        className="form-input"
                                        value={formData.shipping_phone}
                                        onChange={handleInputChange}
                                        required
                                        disabled={selectedAddressId !== 'new'}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email para contacto</label>
                                <input
                                    type="email"
                                    name="shipping_email"
                                    className="form-input"
                                    value={formData.shipping_email}
                                    onChange={handleInputChange}
                                    required
                                    disabled={selectedAddressId !== 'new'}
                                />
                            </div>

                            {selectedAddressId === 'new' && user && (
                                <div className="save-address-option">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={saveNewAddress}
                                            onChange={(e) => setSaveNewAddress(e.target.checked)}
                                        />
                                        Guardar esta morada no meu perfil para futuras compras
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Billing Section REMOVED as per request */}
                    {/* User requested to remove explicit billing data section. */}

                    {/* Payment Section */}
                    <div className="checkout-section">
                        <h2>💳 Método de Pagamento</h2>
                        <div className="payment-methods">
                            <div
                                className={`payment-method-card ${paymentMethod === 'MBWAY' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('MBWAY')}
                            >
                                <FaMobileAlt className="payment-method-icon" />
                                <span>MB Way</span>
                            </div>
                            <div
                                className={`payment-method-card ${paymentMethod === 'MULTIBANCO' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('MULTIBANCO')}
                            >
                                <FaMoneyBillWave className="payment-method-icon" />
                                <span>Multibanco</span>
                            </div>
                            <div
                                className={`payment-method-card ${paymentMethod === 'CARD' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('CARD')}
                            >
                                <FaCreditCard className="payment-method-icon" />
                                <span>Cartão Crédito</span>
                            </div>
                        </div>

                        {/* Payment Method Specific Inputs */}
                        <div style={{ marginTop: '1.5rem' }}>
                            {paymentMethod === 'MBWAY' && (
                                <div className="form-group">
                                    <label>Número de Telemóvel MB Way</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={paymentDetails}
                                        onChange={(e) => setPaymentDetails(e.target.value)}
                                        placeholder="9XXXXXXXX"
                                        required
                                    />
                                </div>
                            )}
                            {paymentMethod === 'MULTIBANCO' && (
                                <div className="info-box">
                                    <p>Os dados para pagamento (Entidade e Referência) serão enviados para o seu email após a confirmação.</p>
                                </div>
                            )}
                            {paymentMethod === 'CARD' && (
                                <div className="info-box">
                                    <p>Será redirecionado para a página segura de pagamento. (Simulação: Pagamento aceite automaticamente)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Column */}
                <div className="checkout-summary-column">
                    <div className="order-summary-box">
                        <h3>Resumo da Encomenda</h3>
                        <div className="summary-items">
                            {items.map((item, idx) => {
                                const mainImage = item.jersey.images.find(img => img.is_main) || item.jersey.images[0];
                                return (
                                    <div key={idx} className="summary-item">
                                        {mainImage && (
                                            <img src={mainImage.image_base64} alt={item.jersey.team_name} className="summary-item-img" />
                                        )}
                                        <div className="summary-item-details">
                                            <h4>{item.jersey.team_name}</h4>
                                            <p>{item.size} x {item.quantity}</p>
                                            <p>{formatPrice(item.finalPrice)}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="summary-totals">
                            <div className="total-row final">
                                <span>Total a Pagar</span>
                                <span>{formatPrice(finalTotal)}</span>
                            </div>
                        </div>

                        {/* Policy & Submit */}
                        <label className="policy-checkbox">
                            <input
                                type="checkbox"
                                checked={policyAccepted}
                                onChange={(e) => setPolicyAccepted(e.target.checked)}
                            />
                            <span>
                                Declaro que li e aceito que <strong>não são aceites devoluções</strong> destes produtos personalizados/exclusivos.
                            </span>
                        </label>

                        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                        <button
                            type="submit"
                            className="checkout-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'A Processar...' : 'Confirmar e Pagar'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
