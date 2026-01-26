import { useState, useEffect } from 'react';
import { catalogService } from '../../services/catalog.service';
import type { League } from '../../services/catalog.service';
import { FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Reuse styles or create new

const LeagueManager = () => {
    const navigate = useNavigate();
    const [leagues, setLeagues] = useState<League[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        loadLeagues();
    }, []);

    const loadLeagues = async () => {
        setIsLoading(true);
        try {
            const data = await catalogService.getLeagues();
            setLeagues(data);
        } catch (error) {
            console.error("Error loading leagues:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await catalogService.createLeague({ name, image_base64: image || undefined });
            setName('');
            setImage(null);
            loadLeagues();
        } catch (error) {
            alert('Erro ao criar liga');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem a certeza? Vai eliminar também os clubes desta liga!')) return;
        try {
            await catalogService.deleteLeague(id);
            loadLeagues();
        } catch (error) {
            alert('Erro ao eliminar liga');
        }
    };

    return (
        <div className="admin-dashboard-container">
            <button className="back-btn" onClick={() => navigate('/admin')} style={{ marginBottom: '20px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaArrowLeft /> Voltar
            </button>

            <h1>Gerir Ligas</h1>

            {/* Create Form */}
            <div className="admin-form-card" style={{ background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                <h3>Adicionar Nova Liga</h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gap: '15px' }}>
                    <div className="form-group">
                        <label>Nome da Liga</label>
                        <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Imagem (Logo)</label>
                        <input className="form-control" type="file" accept="image/*" onChange={handleImageUpload} />
                        {image && <img src={image} alt="Preview" style={{ height: '50px', marginTop: '10px' }} />}
                    </div>
                    <button className="auth-btn" type="submit" style={{ width: 'auto', justifySelf: 'start' }}>
                        <FaPlus /> Adicionar
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="leagues-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {leagues.map(league => (
                    <div key={league.id} className="league-card" style={{ background: 'var(--color-bg-secondary)', padding: '15px', borderRadius: '10px', textAlign: 'center', position: 'relative' }}>
                        {league.image_base64 && <img src={league.image_base64} alt={league.name} style={{ height: '80px', marginBottom: '10px', objectFit: 'contain' }} />}
                        <h4>{league.name}</h4>
                        <button
                            onClick={() => handleDelete(league.id!)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeagueManager;
