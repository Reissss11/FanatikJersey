import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profile.service';
import type { Address, UserInfo } from '../../services/profile.service';
import AddressForm from '../../components/Profile/AddressForm';
import PasswordInput from '../../components/Shared/PasswordInput';
import { FaEdit, FaTrash, FaPlus, FaCamera } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
    const { updateProfileImage, refreshUser } = useAuth();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(true);

    // Password Change State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getProfile();
            setUserInfo({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email,
                username: data.username
            });
            setAddresses(data.addresses);
            if (data.user_images && data.user_images.length > 0) {
                // Assuming the last uploaded is the current one
                setProfileImage(data.user_images[data.user_images.length - 1].image_data);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInfoUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInfo) return;
        try {
            await profileService.updateInfo({
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                email: userInfo.email,
                username: userInfo.username
            });
            setIsEditingInfo(false);
            refreshUser(); // Sync with header
        } catch (error) {
            console.error("Error updating info:", error);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            alert("As novas palavras-passe não coincidem.");
            return;
        }
        try {
            await profileService.changePassword(passwordData);
            alert("Palavra-passe alterada com sucesso!");
            setShowPasswordForm(false);
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error: any) {
            console.error("Error changing password:", error);
            alert(error.response?.data?.detail || "Erro ao alterar palavra-passe.");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                try {
                    await profileService.uploadImage(base64String);
                    setProfileImage(base64String);
                    updateProfileImage(base64String); // Sync with header
                } catch (error) {
                    console.error("Error uploading image:", error);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddressSubmit = async (address: Address) => {
        try {
            if (editingAddress && editingAddress.id) {
                await profileService.updateAddress(editingAddress.id, address);
            } else {
                await profileService.addAddress(address);
            }
            setShowAddressForm(false);
            setEditingAddress(null);
            loadProfile(); // Reload to get updated list
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Erro ao guardar morada. Verifique se atingiu o limite de 3.");
        }
    };

    const handleDeleteAddress = async (id: number) => {
        if (window.confirm("Tem a certeza que deseja eliminar esta morada?")) {
            try {
                await profileService.deleteAddress(id);
                loadProfile();
            } catch (error) {
                console.error("Error deleting address:", error);
            }
        }
    };

    if (loading) return <div className="profile-container">A carregar perfil...</div>;

    return (
        <div className="profile-container">
            <h1>O Meu Perfil</h1>

            <div className="profile-header">
                <div className="profile-image-section">
                    <div className="image-container">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="profile-img" />
                        ) : (
                            <div className="profile-placeholder">{userInfo?.username?.charAt(0).toUpperCase()}</div>
                        )}
                        <label className="image-upload-btn">
                            <FaCamera />
                            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                        </label>
                    </div>
                </div>

                <div className="user-info-section">
                    <div className="section-header">
                        <h2>Informação Pessoal</h2>
                        {!isEditingInfo && (
                            <button onClick={() => setIsEditingInfo(true)} className="icon-btn"><FaEdit /></button>
                        )}
                    </div>

                    {isEditingInfo ? (
                        <form onSubmit={handleInfoUpdate} className="info-form">
                            <input
                                value={userInfo?.username}
                                onChange={(e) => setUserInfo(prev => ({ ...prev!, username: e.target.value }))}
                                placeholder="Nome de Utilizador"
                            />
                            <input
                                value={userInfo?.first_name}
                                onChange={(e) => setUserInfo(prev => ({ ...prev!, first_name: e.target.value }))}
                                placeholder="Nome"
                            />
                            <input
                                value={userInfo?.last_name}
                                onChange={(e) => setUserInfo(prev => ({ ...prev!, last_name: e.target.value }))}
                                placeholder="Apelido"
                            />
                            <input
                                value={userInfo?.email}
                                onChange={(e) => setUserInfo(prev => ({ ...prev!, email: e.target.value }))}
                                placeholder="Email"
                            />
                            <div className="form-actions">
                                <button type="button" onClick={() => setIsEditingInfo(false)} className="cancel-btn">Cancelar</button>
                                <button type="submit" className="save-btn">Guardar</button>
                            </div>
                        </form>
                    ) : (
                        <div className="info-display">
                            <p><strong>Utilizador:</strong> {userInfo?.username}</p>
                            <p><strong>Nome:</strong> {userInfo?.first_name} {userInfo?.last_name}</p>
                            <p><strong>Email:</strong> {userInfo?.email}</p>
                        </div>
                    )}

                    <div className="password-section" style={{ marginTop: '2rem' }}>
                        <div className="section-header">
                            <h2>Alterar Palavra-passe</h2>
                            {!showPasswordForm && (
                                <button onClick={() => setShowPasswordForm(true)} className="icon-btn"><FaEdit /></button>
                            )}
                        </div>
                        {showPasswordForm && (
                            <form onSubmit={handlePasswordChange} className="info-form">
                                <PasswordInput
                                    placeholder="Palavra-passe Atual"
                                    value={passwordData.old_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                    required
                                />
                                <PasswordInput
                                    placeholder="Nova Palavra-passe"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    required
                                />
                                <PasswordInput
                                    placeholder="Confirmar Nova Palavra-passe"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    required
                                />
                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowPasswordForm(false)} className="cancel-btn">Cancelar</button>
                                    <button type="submit" className="save-btn">Alterar</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <div className="addresses-section">
                <div className="section-header">
                    <h2>As Minhas Moradas ({addresses.length}/3)</h2>
                    {addresses.length < 3 && !showAddressForm && (
                        <button onClick={() => { setEditingAddress(null); setShowAddressForm(true); }} className="add-btn">
                            <FaPlus /> Adicionar
                        </button>
                    )}
                </div>

                {showAddressForm && (
                    <AddressForm
                        initialData={editingAddress}
                        onSubmit={handleAddressSubmit}
                        onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }}
                    />
                )}

                <div className="addresses-grid">
                    {addresses.map(addr => (
                        <div key={addr.id} className="address-card">
                            <div className="address-actions">
                                <button onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }} className="icon-btn"><FaEdit /></button>
                                <button onClick={() => addr.id && handleDeleteAddress(addr.id)} className="icon-btn delete"><FaTrash /></button>
                            </div>
                            <p><strong>{addr.first_name} {addr.last_name}</strong></p>
                            <p>{addr.street_address}</p>
                            <p>{addr.postal_code} {addr.city}</p>
                            <p>{addr.district}, {addr.country}</p>
                            <p>{addr.phone_number}</p>
                            <p className="email-text">{addr.email}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
