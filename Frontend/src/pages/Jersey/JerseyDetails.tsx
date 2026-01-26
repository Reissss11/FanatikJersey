import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService, type Jersey, type JerseyImage } from '../../services/catalog.service';
import { useCart } from '../../contexts/CartContext';
import './JerseyDetails.css';

const JerseyDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { addToCart } = useCart();
    const [jersey, setJersey] = useState<Jersey | null>(null);
    const [selectedImage, setSelectedImage] = useState<JerseyImage | null>(null);
    const [selectedSize, setSelectedSize] = useState("M");
    const [customName, setCustomName] = useState("");
    const [customNumber, setCustomNumber] = useState("");
    const [selectedPatches, setSelectedPatches] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const togglePatch = (patch: string) => {
        setSelectedPatches(prev =>
            prev.includes(patch)
                ? prev.filter(p => p !== patch)
                : [...prev, patch]
        );
    };

    useEffect(() => {
        const fetchJersey = async () => {
            if (!id) return;
            try {
                const data = await catalogService.getJersey(Number(id));
                setJersey(data);
                // Set initial image (main or first)
                if (data.images && data.images.length > 0) {
                    const main = data.images.find((img: JerseyImage) => img.is_main) || data.images[0];
                    setSelectedImage(main);
                }
            } catch (error) {
                console.error("Error fetching jersey:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJersey();
    }, [id]);

    if (loading) return <div className="loading-container">A carregar...</div>;
    if (!jersey) return <div className="error-container">Camisola não encontrada.</div>;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price);
    };

    return (
        <div className="jersey-details-container">
            <Link to="/" className="back-link">← Voltar</Link>

            <div className="jersey-content">
                {/* Left: Thumbnails */}
                {/* User said: "ao entrar dentro da camsiola é que vais ter à esquerda as fotos todas" */}
                <div className="thumbnails-column">
                    {jersey.images.map((img) => (
                        <div
                            key={img.id}
                            className={`thumbnail ${selectedImage?.id === img.id ? 'active' : ''}`}
                            onClick={() => setSelectedImage(img)}
                        >
                            <img src={img.image_base64} alt="Thumbnail" />
                        </div>
                    ))}
                </div>

                {/* Middle: Main Image */}
                {/* User said: "á direira aparece a imagem grande da foto selecionada" */}
                <div className="main-image-column">
                    {selectedImage ? (
                        <img src={selectedImage.image_base64} alt={`${jersey.team_name} Main`} className="main-image" />
                    ) : (
                        <div className="no-image">Sem Imagem</div>
                    )}
                </div>

                {/* Right: Info and Cart */}
                {/* User said: "e dps mais à direita é onde vais ter o preço etc, e o botão para adicioar ao carrinho" */}
                <div className="info-column">
                    <h1 className="jersey-title">{jersey.team_name}</h1>
                    <h2 className="jersey-subtitle">{jersey.season} - {jersey.jersey_type?.name}</h2>

                    <div className="price-container">
                        {jersey.jersey_type?.original_price && jersey.jersey_type.original_price > (jersey.jersey_type?.current_price || 0) && (
                            <span className="original-price">{formatPrice(jersey.jersey_type.original_price)}</span>
                        )}
                        <span className="current-price">
                            {jersey.jersey_type?.current_price ? formatPrice(jersey.jersey_type.current_price) : 'Preço Sob Consulta'}
                        </span>
                    </div>

                    <p className="description">{jersey.description || "Sem descrição disponível."}</p>

                    <div className="size-selector">
                        <label>Tamanho:</label>
                        <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="size-select"
                        >
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                            <option value="XXXL">XXXL</option>
                        </select>
                    </div>

                    <div className="customization-section">
                        <h3>Personalização (+3.00€)</h3>
                        <div className="custom-input-group">
                            <input
                                type="text"
                                placeholder="Nome"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                className="custom-input"
                            />
                            <input
                                type="text"
                                placeholder="Número"
                                value={customNumber}
                                onChange={(e) => setCustomNumber(e.target.value)}
                                className="custom-input number"
                            />
                        </div>

                        <h3>Patches (+2.00€ cada)</h3>
                        <div className="patches-container">
                            {["Liga", "Liga Europa", "Liga dos Campeões", "Campeão da Liga"].map(patch => (
                                <label key={patch} className="patch-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedPatches.includes(patch)}
                                        onChange={() => togglePatch(patch)}
                                    />
                                    {patch}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(jersey, selectedSize, customName, customNumber, selectedPatches)}
                    >
                        Adicionar ao Carrinho {((customName || customNumber) || selectedPatches.length > 0) ? `(+${((customName || customNumber ? 3 : 0) + (selectedPatches.length * 2)).toFixed(2)}€)` : ''}
                    </button>

                    <div className="details-extra">
                        <p><strong>Cor Principal:</strong> {jersey.main_color}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JerseyDetails;
