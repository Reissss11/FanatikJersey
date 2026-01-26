import Header from '../Header/Header';
import Footer from '../Footer/Footer';
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
            <Footer />

        </div>
    );
};

export default Layout;
