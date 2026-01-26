import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { authService } from '../../services/auth.service';
import PasswordInput from '../../components/Shared/PasswordInput';
import './Auth.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        new_password: '',
        confirm_password: ''
    });

    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (formData.new_password !== formData.confirm_password) {
            setError("As palavras-passe não coincidem.");
            return;
        }

        if (!token) {
            setError("Token inválido.");
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword({
                token,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password
            });
            setMessage("Palavra-passe alterada com sucesso! A redirecionar...");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Ocorreu um erro. O link pode ter expirado.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title">Erro</h2>
                    <p className="error-message">Token de recuperação em falta.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="auth-close-btn" onClick={() => navigate('/login')} aria-label="Fechar">
                    <FaTimes />
                </button>
                <h2 className="auth-title">Nova Palavra-passe</h2>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="new_password">Nova Palavra-passe</label>
                        <PasswordInput
                            id="new_password"
                            name="new_password"
                            className="form-control"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirmar Palavra-passe</label>
                        <PasswordInput
                            id="confirm_password"
                            name="confirm_password"
                            className="form-control"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="auth-actions">
                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? 'A alterar...' : 'Alterar Palavra-passe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
