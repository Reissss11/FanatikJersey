import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForbiddenPage.css';

const ForbiddenPage = () => {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        const redirect = setTimeout(() => {
            navigate('/');
        }, 5000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirect);
        };
    }, [navigate]);

    return (
        <div className="forbidden-container">
            <h1 className="forbidden-title">Acesso Negado</h1>
            <p className="forbidden-message">
                Não tem permissões para aceder a esta página.
            </p>
            <p className="forbidden-timer">
                Será redirecionado para a página principal em {seconds} segundos...
            </p>
        </div>
    );
};

export default ForbiddenPage;
