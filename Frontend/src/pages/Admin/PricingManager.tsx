import { useState, useEffect } from 'react';
import { catalogService } from '../../services/catalog.service';
import type { JerseyType } from '../../services/catalog.service';
import { FaTrash, FaPlus, FaArrowLeft, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const PricingManager = () => {
    const navigate = useNavigate();
    const [types, setTypes] = useState<JerseyType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State (New)
    const [name, setName] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [description, setDescription] = useState('');

    // Editing State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<JerseyType>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await catalogService.getTypes();
            setTypes(data);
        } catch (error) {
            console.error("Error loading types:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await catalogService.createType({
                name,
                original_price: parseFloat(originalPrice),
                current_price: parseFloat(currentPrice),
                description
            });
            setName('');
            setOriginalPrice('');
            setCurrentPrice('');
            setDescription('');
            loadData();
        } catch (error) {
            alert('Erro ao criar tipo. O nome deve ser único.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem a certeza?')) return;
        try {
            await catalogService.deleteType(id);
            loadData();
        } catch (error) {
            alert('Erro ao eliminar tipo. Pode estar em uso.');
        }
    };

    const startEdit = (type: JerseyType) => {
        setEditingId(type.id!);
        setEditForm(type);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            await catalogService.updateType(editingId, editForm as JerseyType);
            cancelEdit();
            loadData();
        } catch (error) {
            alert('Erro ao guardar alterações');
        }
    };

    return (
        <div className="admin-dashboard-container">
            <button className="back-btn" onClick={() => navigate('/admin')} style={{ marginBottom: '20px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaArrowLeft /> Voltar
            </button>

            <h1>Gerir Preços & Tipos</h1>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>Define aqui os preços globais para cada tipo de camisola.</p>

            {/* Create Form */}
            <div className="admin-form-card" style={{ background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                <h3>Adicionar Novo Tipo</h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                    <div className="form-group">
                        <label>Nome (ex: Fã)</label>
                        <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Preço Original (€)</label>
                        <input className="form-control" type="number" step="0.01" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Preço Venda (€)</label>
                        <input className="form-control" type="number" step="0.01" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} required />
                    </div>
                    <button className="auth-btn" type="submit" style={{ width: 'auto', marginBottom: '0' }}>
                        <FaPlus />
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="types-list" style={{ display: 'grid', gap: '15px' }}>
                {types.map(type => (
                    <div key={type.id} className="type-row" style={{ background: 'var(--color-bg-secondary)', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {editingId === type.id ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', width: '100%', alignItems: 'center' }}>
                                <input className="form-control" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                <input className="form-control" type="number" step="0.01" value={editForm.original_price} onChange={e => setEditForm({ ...editForm, original_price: parseFloat(e.target.value) })} />
                                <input className="form-control" type="number" step="0.01" value={editForm.current_price} onChange={e => setEditForm({ ...editForm, current_price: parseFloat(e.target.value) })} />
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button onClick={saveEdit} style={{ background: 'green', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}><FaSave /></button>
                                    <button onClick={cancelEdit} style={{ background: 'gray', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}><FaTimes /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{type.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>{type.description}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ textDecoration: 'line-through', color: '#ff6b6b', fontSize: '0.9rem' }}>{type.original_price}€</div>
                                        <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{type.current_price}€</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => startEdit(type)} style={{ background: 'none', border: 'none', color: 'gold', cursor: 'pointer' }}><FaEdit /></button>
                                        <button onClick={() => handleDelete(type.id!)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><FaTrash /></button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingManager;
