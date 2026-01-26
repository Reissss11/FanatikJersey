import { useState, useEffect } from 'react';
import { catalogService } from '../../services/catalog.service';
import type { League, Team } from '../../services/catalog.service';
import { FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const TeamManager = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [leagueId, setLeagueId] = useState('');
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [leaguesData, teamsData] = await Promise.all([
                catalogService.getLeagues(),
                catalogService.getTeams()
            ]);
            setLeagues(leaguesData);
            setTeams(teamsData);
            // Enrich teams with league names for display if not populated by backend
            // (Assuming backend might not join, or we do it here)
        } catch (error) {
            console.error("Error loading data:", error);
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
            if (!leagueId) {
                alert('Selecione uma liga');
                return;
            }

            await catalogService.createTeam({
                name,
                league_id: parseInt(leagueId),
                image_base64: image || undefined
            });
            setName('');
            setLeagueId('');
            setImage(null);

            // Reload teams
            const newTeams = await catalogService.getTeams();
            setTeams(newTeams);
        } catch (error) {
            alert('Erro ao criar clube');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem a certeza? Vai eliminar também as camisolas deste clube!')) return;
        try {
            await catalogService.deleteTeam(id);
            const newTeams = await catalogService.getTeams();
            setTeams(newTeams);
        } catch (error) {
            alert('Erro ao eliminar clube');
        }
    };

    // Helper to get league name
    const getLeagueName = (id: number) => {
        const l = leagues.find(x => x.id === id);
        return l ? l.name : id;
    };

    return (
        <div className="admin-dashboard-container">
            <button className="back-btn" onClick={() => navigate('/admin')} style={{ marginBottom: '20px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaArrowLeft /> Voltar
            </button>

            <h1>Gerir Clubes</h1>

            {/* Create Form */}
            <div className="admin-form-card" style={{ background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                <h3>Adicionar Novo Clube</h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gap: '15px' }}>
                    <div className="form-group">
                        <label>Nome do Clube</label>
                        <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Liga</label>
                        <select className="form-control" value={leagueId} onChange={e => setLeagueId(e.target.value)} required>
                            <option value="">Selecione uma Liga</option>
                            {leagues.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Imagem (Emblema)</label>
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
                {teams.map(team => (
                    <div key={team.id} className="league-card" style={{ background: 'var(--color-bg-secondary)', padding: '15px', borderRadius: '10px', textAlign: 'center', position: 'relative' }}>
                        {team.image_base64 && <img src={team.image_base64} alt={team.name} style={{ height: '80px', marginBottom: '10px', objectFit: 'contain' }} />}
                        <h4>{team.name}</h4>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{getLeagueName(team.league_id)}</p>
                        <button
                            onClick={() => handleDelete(team.id!)}
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

export default TeamManager;
