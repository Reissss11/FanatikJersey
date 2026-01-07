import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        identifier: '', // Can be username or email
        password: ''
    });
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
        setError(null);
        setIsLoading(true);

        try {
            // authService.login returns the full response data { access_token: "...", token_type: "..." }
            const data = await authService.login(formData);

            // Update the global auth context state
            login(data.access_token);

            navigate('/'); // Redirect to home on success
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Ocorreu um erro ao tentar iniciar sessão. Por favor tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Iniciar Sessão</h2>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="identifier">Nome de utilizador ou Email</label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            className="form-control"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                            placeholder="Insira o seu utilizador ou email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Palavra-passe</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Insira a sua palavra-passe"
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={isLoading}>
                        {isLoading ? 'A carregar...' : 'Entrar'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Ainda não tem conta?
                        <Link to="/register" className="auth-link">Registar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
