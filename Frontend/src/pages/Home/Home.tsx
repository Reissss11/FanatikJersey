import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../../components/Carousel/Carousel';
import promo1 from '../../assets/Promos/Promo1teste.png';
import { catalogService, type Jersey } from '../../services/catalog.service';
import JerseyCard from '../../components/Shared/JerseyCard';
import './Home.css';

const Home = () => {
    const promoImages = [promo1];
    const [popularJerseys, setPopularJerseys] = useState<Jersey[]>([]);
    const [newJerseys, setNewJerseys] = useState<Jersey[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Popular (Simulated by random or price desc for now as we don't have sales stats yet, 
                // but user asked for "most ordered". I'll map to 'popular' which I haven't implemented backend logic for orders yet. 
                // I will use 'price_desc' as proxy or just 'popular' if I added it to Enum but I didn't add logic.
                // Wait, I didn't add 'popular' logic in controller, I added 'newest' and price sorts.
                // Let's use 'newest' for New and maybe just fetch any for popular or random? 
                // Re-reading plan: "Mais Procurados... initially show random". 
                // I will fetch 10 and take first 5 for one, and maybe 'newest' for other.

                // Let's implement 'newest' correctly.
                // Let's implement 'newest' correctly.
                const newArrivals = await catalogService.getJerseys({}, { limit: 8, sortBy: 'newest' });
                setNewJerseys(newArrivals.data);

                // For "Mais Procurados", let's use a different fetch or just shuffle?
                // I'll fetch without sort (default ID sort) and take some.
                const popular = await catalogService.getJerseys({}, { limit: 8 });
                // In real app, this would be SortBy.Popular
                setPopularJerseys(popular.data);

            } catch (error) {
                console.error("Error fetching homepage jerseys:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const SectionLoader = () => (
        <div className="section-loader">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
        </div>
    );

    return (
        <div className="home-container">
            <section className="home-carousel-section">
                <Carousel images={promoImages} />
            </section>

            <div className="home-content">
                {/* Section 1: Mais Procurados */}
                <section className="jersey-section">
                    <div className="section-header">
                        <h2>Mais Procurados</h2>
                        <Link to="/catalog" className="view-all-link">Ver Tudo</Link>
                    </div>

                    {isLoading ? <SectionLoader /> : (
                        <div className="horizontal-scroll-container">
                            {popularJerseys.map(jersey => (
                                <JerseyCard key={jersey.id} jersey={jersey} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Section 2: Novidades */}
                <section className="jersey-section">
                    <div className="section-header">
                        <h2>Novidades</h2>
                        <Link to="/catalog?sort=newest" className="view-all-link">Ver Tudo</Link>
                    </div>

                    {isLoading ? <SectionLoader /> : (
                        <div className="horizontal-scroll-container">
                            {newJerseys.map(jersey => (
                                <JerseyCard key={jersey.id} jersey={jersey} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;
