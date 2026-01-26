import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaTimes, FaGoogle } from 'react-icons/fa';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { auth, googleProvider } from '../../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import PasswordInput from '../../components/Shared/PasswordInput';
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

            // Update the global auth context state and get profile data back
            const profile = await login(data.access_token);

            console.log("LOGIN RESULT PROFILE:", profile);

            if (profile && profile.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
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

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Send google data to backend
            const data = await authService.googleLogin({
                email: user.email,
                google_id: user.uid,
                first_name: user.displayName?.split(' ')[0] || 'User',
                last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
                username: user.email?.split('@')[0] // Optional suggestion
            });

            login(data.access_token);
            navigate('/');
        } catch (err: any) {
            console.error("Google Login Error:", err);
            setError('Erro ao iniciar sessão com Google. Verifique a configuração.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="auth-close-btn" onClick={() => navigate('/')} aria-label="Fechar">
                    <FaTimes />
                </button>
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
                        <PasswordInput
                            id="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Insira a sua palavra-passe"
                        />
                    </div>

                    <div className="auth-actions">
                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? 'A carregar...' : 'Entrar'}
                        </button>

                        <button type="button" className="auth-btn google-btn" onClick={handleGoogleLogin} disabled={isLoading}>
                            <FaGoogle style={{ marginRight: '8px' }} />
                            Entrar com Google
                        </button>
                    </div>
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
