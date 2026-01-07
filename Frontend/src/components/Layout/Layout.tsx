import Header from '../Header/Header';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <footer className="footer">
                <div className="footer-content">
                    <p>&copy; {new Date().getFullYear()} FanatikJersey. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
