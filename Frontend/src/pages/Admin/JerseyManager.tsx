import { useState, useEffect } from 'react';
import { catalogService } from '../../services/catalog.service';
import type { Team, JerseyImage, JerseyType } from '../../services/catalog.service';
import { FaTrash, FaPlus, FaArrowLeft, FaStar, FaRegStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './AdminDashboard.css';

// Extended type for local handling with unique ID for DnD
interface SortableJerseyImage extends JerseyImage {
    dndId: string;
}

// Sortable Item Component
const SortableImageItem = ({ img, index, onRemove, onSetMain }: { img: SortableJerseyImage, index: number, onRemove: (i: number) => void, onSetMain: (i: number) => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: img.dndId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as 'relative',
        width: '100px',
        height: '100px',
        border: img.is_main ? '2px solid gold' : '1px solid #ccc',
        touchAction: 'none' // Important for touch devices
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <img src={img.image_base64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
            {/* Buttons need to stop propagation to allow clicking them without dragging */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', zIndex: 2 }}>
                <FaTrash size={10} />
            </button>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSetMain(index); }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'none', border: 'none', color: img.is_main ? 'gold' : 'gray', cursor: 'pointer', zIndex: 2 }}>
                {img.is_main ? <FaStar /> : <FaRegStar />}
            </button>
        </div>
    );
};

const JerseyManager = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [types, setTypes] = useState<JerseyType[]>([]);
    const [jerseys, setJerseys] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // View State
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [teamId, setTeamId] = useState('');
    const [season, setSeason] = useState('');
    const [typeId, setTypeId] = useState('');
    const [color, setColor] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<SortableJerseyImage[]>([]);

    // Search State
    const [teamSearch, setTeamSearch] = useState('');
    const [showTeamDropdown, setShowTeamDropdown] = useState(false);

    // Filter jerseys logic
    const [filterText, setFilterText] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require drag of 8px to start, prevents accidental drags on click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [teamsData, typesData, jerseysResponse] = await Promise.all([
                catalogService.getTeams(),
                catalogService.getTypes(),
                catalogService.getJerseys({}, { limit: 1000 }) // Fetch all for admin management (or implement pagination later here too)
            ]);
            setTeams(teamsData);
            setTypes(typesData);
            setJerseys(jerseysResponse.data);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNew = () => {
        resetForm();
        setIsFormVisible(true);
    };

    const handleEdit = (jersey: any) => {
        setEditingId(jersey.id);
        const team = teams.find(t => t.id === jersey.team_id);
        setTeamId(jersey.team_id.toString());
        setTeamSearch(team ? team.name : '');
        setSeason(jersey.season);
        setTypeId(jersey.jersey_type_id.toString());
        setColor(jersey.main_color);
        setDescription(jersey.description || '');

        // Add dndIds
        const loadedImages = (jersey.images || []).map((img: JerseyImage) => ({
            ...img,
            dndId: `id-${img.id || Date.now()}-${Math.random()}`
        }));
        setImages(loadedImages);

        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!teamId || !typeId || images.length === 0) {
                alert('Preencha os campos obrigatórios e adicione uma imagem');
                return;
            }

            // Clean images for submission (remove dndId if needed or backend will ignore extra fields? 
            // Better to be clean: map back to JerseyImage)
            const cleanImages: JerseyImage[] = images.map(({ dndId, ...rest }) => rest);

            const data = {
                team_id: parseInt(teamId),
                season,
                jersey_type_id: parseInt(typeId),
                main_color: color,
                description: description || undefined,
                images: cleanImages
            };

            if (editingId) {
                await catalogService.updateJersey(editingId, data);
                alert("Camisola atualizada com sucesso!");
            } else {
                await catalogService.createJersey(data);
                alert("Camisola criada com sucesso!");
            }

            resetForm();
            setIsFormVisible(false); // Return to list
            loadData();

        } catch (error) {
            alert('Erro ao guardar camisola');
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Tem a certeza que deseja eliminar esta camisola?")) return;
        try {
            await catalogService.deleteJersey(id);
            setJerseys(jerseys.filter(j => j.id !== id));
        } catch (error) {
            alert("Erro ao eliminar");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTeamId('');
        setTeamSearch('');
        setSeason('');
        setTypeId('');
        setColor('');
        setDescription('');
        setImages([]);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (images.length >= 10) {
                alert("Máximo de 10 imagens permitidas.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const isMain = images.length === 0;
                setImages([...images, {
                    image_base64: reader.result as string,
                    is_main: isMain,
                    dndId: `new-${Date.now()}`
                }]);
            };
            reader.readAsDataURL(file);
        }
    };

    const setMainImage = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            is_main: i === index
        }));
        setImages(newImages);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        if (images[index].is_main && newImages.length > 0) {
            newImages[0].is_main = true;
        }
        setImages(newImages);
    };

    // Drag handlers
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((item) => item.dndId === active.id);
                const newIndex = items.findIndex((item) => item.dndId === over?.id);

                // Reorder
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Ensure main image logic is preserved (User request: "move last photo to start")
                // Usually "Main" is just a flag. If we move a non-main to main spot, should it become main?
                // Or does the flag travel with the image?
                // Current logic: `is_main` is a property of the image. 
                // If I move the Main image to the end, it stays Main (images display order changes, identifying star follows it).
                // If user wants the first image to ALWAYS be main, I should force it.
                // However, usually users explicitly set "Main".
                // Let's keep `is_main` attached to the image. 

                return newItems;
            });
        }
    };

    const getPreviewPrice = () => {
        const t = types.find(x => x.id === parseInt(typeId));
        if (t) return `${t.current_price}€ (Orig: ${t.original_price}€)`;
        return '';
    };

    const handleTeamSelect = (team: Team) => {
        setTeamId(team.id!.toString());
        setTeamSearch(team.name);
        setShowTeamDropdown(false);
    };

    // Filter logic
    const filteredJerseysList = jerseys.filter(j => {
        const team = teams.find(t => t.id === j.team_id);
        const searchString = `${team?.name} ${j.season} ${j.jersey_type?.name} ${j.main_color} ${j.description}`.toLowerCase();
        return searchString.includes(filterText.toLowerCase());
    });
    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(teamSearch.toLowerCase())
    );

    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>A carregar...</div>;

    return (
        <div className="admin-dashboard-container">
            <button className="back-btn" onClick={() => navigate('/admin')} style={{ marginBottom: '20px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaArrowLeft /> Voltar
            </button>

            <h1>Gerir Camisolas</h1>

            {/* List View */}
            {!isFormVisible && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
                        <input
                            className="form-control"
                            placeholder="Pesquisar camisolas (Clube, Época, Tipo, Cor...)"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button className="auth-btn" onClick={handleAddNew} style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaPlus /> Nova Camisola
                        </button>
                    </div>

                    <div className="jerseys-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {filteredJerseysList.map(j => {
                            const mainImg = j.images.find((x: any) => x.is_main) || j.images[0];
                            const team = teams.find(t => t.id === j.team_id);
                            return (
                                <div key={j.id} className="admin-card" style={{ background: 'var(--color-bg-secondary)', borderRadius: '10px', padding: '15px' }}>
                                    <div style={{ height: '200px', overflow: 'hidden', borderRadius: '5px', marginBottom: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {mainImg ? (
                                            <img src={mainImg.image_base64} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                                        ) : (
                                            <span style={{ color: '#000' }}>Sem Imagem</span>
                                        )}
                                    </div>
                                    <h4>{team?.name || 'Desconhecido'} {j.season}</h4>
                                    <p style={{ color: '#aaa', fontSize: '0.9em' }}>{j.jersey_type?.name} - {j.main_color}</p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button onClick={() => handleEdit(j)} style={{ flex: 1, padding: '8px', background: 'var(--color-primary)', border: 'none', borderRadius: '5px', cursor: 'pointer', color: 'white' }}>Editar</button>
                                        <button onClick={() => handleDelete(j.id)} style={{ flex: 1, padding: '8px', background: 'red', border: 'none', borderRadius: '5px', cursor: 'pointer', color: 'white' }}>Eliminar</button>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredJerseysList.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#aaa', padding: '20px' }}>
                                Nenhuma camisola encontrada.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Form View */}
            {isFormVisible && (
                <div className="admin-form-card" style={{ background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '15px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>{editingId ? 'Editar Camisola' : 'Adicionar Nova Camisola'}</h3>
                        <button onClick={handleCancel} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2em' }}>&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>

                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>Clube (Pesquisar)</label>
                            <input
                                className="form-control"
                                value={teamSearch}
                                onChange={e => {
                                    setTeamSearch(e.target.value);
                                    setShowTeamDropdown(true);
                                    if (!editingId) setTeamId('');
                                }}
                                onFocus={() => {
                                    if (teamSearch) setShowTeamDropdown(true);
                                }}
                                placeholder="Escreva o nome do clube..."
                            />
                            {showTeamDropdown && teamSearch.trim().length > 0 && filteredTeams.length > 0 && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0,
                                    background: 'white', border: '1px solid #ddd',
                                    borderRadius: '0 0 10px 10px', maxHeight: '200px',
                                    overflowY: 'auto', zIndex: 100
                                }}>
                                    {filteredTeams.map(t => (
                                        <div key={t.id} onClick={() => handleTeamSelect(t)} className="dropdown-item" style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                                            {t.image_base64 && <img src={t.image_base64} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />}
                                            <span>{t.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Época</label>
                                <input className="form-control" placeholder="ex: 2024/2025" value={season} onChange={e => setSeason(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select className="form-control" value={typeId} onChange={e => setTypeId(e.target.value)} required>
                                    <option value="">Selecione o Tipo</option>
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} - {t.current_price}€</option>
                                    ))}
                                </select>
                                {typeId && <small style={{ color: 'var(--color-primary)' }}>Preço: {getPreviewPrice()}</small>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Cor Principal</label>
                            <select className="form-control" value={color} onChange={e => setColor(e.target.value)} required>
                                <option value="">Selecione a Cor</option>
                                <option value="Azul">Azul</option>
                                <option value="Vermelho">Vermelho</option>
                                <option value="Verde">Verde</option>
                                <option value="Branco">Branco</option>
                                <option value="Preto">Preto</option>
                                <option value="Rosa">Rosa</option>
                                <option value="Roxo">Roxo</option>
                                <option value="Amarelo">Amarelo</option>
                                <option value="Laranja">Laranja</option>
                                <option value="Cinzento">Cinzento</option>
                                <option value="Dourado">Dourado</option>
                                <option value="Bege">Bege</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Descrição</label>
                            <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label>Imagens (Arraste para reordenar)</label>
                            <input className="form-control" type="file" accept="image/*" onChange={handleImageUpload} disabled={images.length >= 10} />

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={images.map(img => img.dndId)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                        {images.map((img, index) => (
                                            <SortableImageItem
                                                key={img.dndId}
                                                img={img}
                                                index={index}
                                                onRemove={removeImage}
                                                onSetMain={setMainImage}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="auth-btn" type="submit">
                                <FaPlus /> {editingId ? 'Guardar Alterações' : 'Criar Camisola'}
                            </button>
                            <button type="button" className="auth-btn" onClick={handleCancel} style={{ background: '#555' }}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default JerseyManager;
