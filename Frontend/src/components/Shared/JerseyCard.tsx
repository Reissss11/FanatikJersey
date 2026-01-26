import { Link } from 'react-router-dom';
import type { Jersey } from '../../services/catalog.service';
import './JerseyCard.css';

interface JerseyCardProps {
    jersey: Jersey;
}

const JerseyCard = ({ jersey }: JerseyCardProps) => {
    // console.log('Jersey Data:', jersey); // Debug
    const mainImage = jersey.images.find(img => img.is_main) || jersey.images[0];

    return (
        <Link to={`/jerseys/${jersey.id}`} className="jersey-card">
            <div className="jersey-image-container">
                {mainImage ? (
                    <img src={mainImage.image_base64} alt={`${jersey.team_name} jersey`} loading="lazy" />
                ) : (
                    <div className="no-image">Sem Imagem</div>
                )}
            </div>
            <div className="jersey-card-details">
                <h3 className="jersey-card-title">{jersey.team_name}</h3>
                <p className="jersey-card-season">{jersey.season} - {jersey.jersey_type?.name}</p>
                <div className="jersey-card-prices">
                    {jersey.jersey_type?.original_price && jersey.jersey_type.original_price > (jersey.jersey_type?.current_price || 0) && (
                        <span className="jersey-card-original-price">
                            {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(jersey.jersey_type.original_price)}
                        </span>
                    )}
                    <span className="jersey-card-current-price">
                        {jersey.jersey_type?.current_price !== undefined ?
                            new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(jersey.jersey_type.current_price)
                            : (jersey as any).price ? `${(jersey as any).price}€` : 'Preço Sob Consulta'}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default JerseyCard;
