import Carousel from '../../components/Carousel/Carousel';
import promo1 from '../../assets/Promos/Promo1teste.png';
import './Home.css';

const Home = () => {
    const promoImages = [promo1];

    return (
        <div className="home-container">
            <section className="home-carousel-section">
                <Carousel images={promoImages} />
            </section>
        </div>
    );
};

export default Home;
