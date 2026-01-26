import { useState, useEffect } from 'react';
import type { Address } from '../../services/profile.service';
import './AddressForm.css';

interface AddressFormProps {
    initialData?: Address | null;
    onSubmit: (data: Address) => void;
    onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Address>({
        first_name: '',
        last_name: '',
        country: '',
        street_address: '',
        district: '',
        city: '',
        postal_code: '',
        phone_number: '',
        email: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form className="address-form" onSubmit={handleSubmit}>
            <h3>{initialData ? 'Editar Morada' : 'Nova Morada'}</h3>

            <div className="form-row">
                <input name="first_name" placeholder="Nome" value={formData.first_name} onChange={handleChange} required />
                <input name="last_name" placeholder="Apelido" value={formData.last_name} onChange={handleChange} required />
            </div>

            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input name="phone_number" placeholder="Telemóvel" value={formData.phone_number} onChange={handleChange} required />

            <input name="street_address" placeholder="Morada" value={formData.street_address} onChange={handleChange} required />

            <div className="form-row">
                <input name="city" placeholder="Cidade/Região" value={formData.city} onChange={handleChange} required />
                <input name="district" placeholder="Distrito" value={formData.district} onChange={handleChange} required />
            </div>

            <div className="form-row">
                <input name="postal_code" placeholder="Código Postal (0000-000)" value={formData.postal_code} onChange={handleChange} pattern="\d{4}-\d{3}" required />
                <input name="country" placeholder="País" value={formData.country} onChange={handleChange} required />
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="cancel-btn">Cancelar</button>
                <button type="submit" className="save-btn">Guardar</button>
            </div>
        </form>
    );
};

export default AddressForm;
