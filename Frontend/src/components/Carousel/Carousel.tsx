import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Carousel.css';

interface CarouselProps {
    images: string[];
    autoPlayInterval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ images, autoPlayInterval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(interval);
    }, [currentIndex, autoPlayInterval, images.length]);

    if (!images || images.length === 0) {
        return null; // Or a placeholder
    }

    return (
        <div className="carousel-container">
            <div className="carousel-slide">
                <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="carousel-image" />
            </div>

            {images.length > 1 && (
                <>
                    <button className="carousel-btn prev" onClick={prevSlide} aria-label="Previous Slide">
                        <FaChevronLeft />
                    </button>
                    <button className="carousel-btn next" onClick={nextSlide} aria-label="Next Slide">
                        <FaChevronRight />
                    </button>

                    <div className="carousel-indicators">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Carousel;
