import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { authService } from '../../services/auth.service';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            setMessage(response.message || "Email enviado!");
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Ocorreu um erro. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="auth-close-btn" onClick={() => navigate('/login')} aria-label="Voltar">
                    <FaTimes />
                </button>
                <h2 className="auth-title">Recuperar Password</h2>
                <p className="auth-subtitle">Insira o seu email para receber um link de recuperação.</p>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="auth-actions">
                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? 'A enviar...' : 'Enviar Email'}
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>
                        <Link to="/login" className="auth-link">Voltar ao Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
