import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { authService } from '../../services/auth.service';
import PasswordInput from '../../components/Shared/PasswordInput';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
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

        if (formData.password !== formData.confirmPassword) {
            setError('As palavras-passe não coincidem.');
            return;
        }

        setIsLoading(true);

        try {
            await authService.register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            // Auto login or redirect to login (prefer redirect to login for clarity)
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                // Determine if detail is a string or array (standard FastAPI val errors vs custom HTTPExceptions)
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    // Combine validation errors
                    const messages = detail.map((d: any) => d.msg.replace('Value error, ', '')).join(' ');
                    setError(messages);
                } else {
                    setError(detail);
                }
            } else {
                setError('Ocorreu um erro ao criar conta. Por favor tente novamente.');
            }
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
                <h2 className="auth-title">Registar</h2>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="first_name">Nome</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            className="form-control"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            placeholder="Insira o seu nome"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">Apelido</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            className="form-control"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            placeholder="Insira o seu apelido"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Nome de utilizador</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="form-control"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Escolha um nome de utilizador"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Insira o seu email"
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
                            placeholder="Escolha uma palavra-passe"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Palavra-passe</label>
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            className="form-control"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirme a sua palavra-passe"
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={isLoading}>
                        {isLoading ? 'A carregar...' : 'Criar Conta'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Já tem conta?
                        <Link to="/login" className="auth-link">Iniciar Sessão</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
