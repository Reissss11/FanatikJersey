import { useState, useEffect } from 'react';
import { catalogService, type Jersey, type League, type Team, type JerseyType } from '../../services/catalog.service';
import JerseyCard from '../../components/Shared/JerseyCard';
import FilterDropdown from '../../components/Shared/FilterDropdown';
import './Catalog.css';
import { FaFilter, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Catalog = () => {
    // Data State
    const [jerseys, setJerseys] = useState<Jersey[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [types, setTypes] = useState<JerseyType[]>([]);

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false); // Mobile toggle
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Filter State
    const [selectedLeague, setSelectedLeague] = useState<number | undefined>(undefined);
    const [selectedTeam, setSelectedTeam] = useState<number | undefined>(undefined);
    const [selectedType, setSelectedType] = useState<number | undefined>(undefined);
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [search, setSearch] = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(12);

    // Load Initial Metadata (Leagues, Types)
    useEffect(() => {
        const loadMetadata = async () => {
            try {
                const [leaguesData, typesData] = await Promise.all([
                    catalogService.getLeagues(),
                    catalogService.getTypes()
                ]);
                setLeagues(leaguesData);
                setTypes(typesData);
            } catch (error) {
                console.error("Error loading metadata", error);
            }
        };
        loadMetadata();
    }, []);

    // Load Teams when League changes
    useEffect(() => {
        if (selectedLeague) {
            catalogService.getTeams(selectedLeague).then(setTeams);
        } else {
            setTeams([]);
            setSelectedTeam(undefined);
        }
    }, [selectedLeague]);

    // Load Jerseys when any filter changes
    useEffect(() => {
        fetchJerseys();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedLeague, selectedTeam, selectedType, selectedColor, page, search, limit]);

    const toggleDropdown = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const fetchJerseys = async () => {
        setIsLoading(true);
        try {
            const response = await catalogService.getJerseys(
                {
                    league_id: selectedLeague,
                    team_id: selectedTeam,
                    jersey_type_id: selectedType,
                    main_color: selectedColor || undefined,
                    search: search || undefined
                },
                {
                    page,
                    limit: limit,
                    sortBy: 'newest'
                }
            );
            setJerseys(response.data);
            setTotalPages(response.total_pages);
        } catch (error) {
            console.error("Error fetching jerseys", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeagueChange = (id: number) => {
        if (selectedLeague === id) {
            setSelectedLeague(undefined); // Deselect
        } else {
            setSelectedLeague(id);
        }
        setSelectedTeam(undefined); // Reset team
        setPage(1);
    };

    const colors = ["Azul", "Vermelho", "Verde", "Branco", "Preto", "Rosa", "Roxo", "Amarelo", "Laranja", "Cinzento", "Dourado", "Bege"];

    return (
        <div className="catalog-page">
            <div className="catalog-container">
                {/* Mobile Filter Toggle */}
                <button className="mobile-filter-btn" onClick={() => setShowFilters(!showFilters)}>
                    <FaFilter /> Filtros
                </button>

                {/* Sidebar Filters */}
                <aside className={`catalog-sidebar ${showFilters ? 'open' : ''}`}>
                    <div className="sidebar-header-mobile">
                        <h2>Filtros</h2>
                        <button className="close-filters-btn" onClick={() => setShowFilters(false)}>✕</button>
                    </div>

                    <FilterDropdown
                        title="Pesquisa"
                        isOpen={activeDropdown === 'search'}
                        onClick={() => toggleDropdown('search')}
                        activeCount={search ? 1 : 0}
                        onClear={() => { setSearch(''); setPage(1); }}
                    >
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Procurar..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                    </FilterDropdown>

                    <FilterDropdown
                        title="Ligas"
                        isOpen={activeDropdown === 'leagues'}
                        onClick={() => toggleDropdown('leagues')}
                        activeCount={selectedLeague ? 1 : 0}
                        selectedLabel={selectedLeague ? leagues.find(l => l.id === selectedLeague)?.name : undefined}
                        onClear={() => handleLeagueChange(selectedLeague!)}
                    >
                        <div className="filter-list">
                            {leagues.map(league => (
                                <div
                                    key={league.id}
                                    className={`filter-item ${selectedLeague === league.id ? 'active' : ''}`}
                                    onClick={() => { handleLeagueChange(league.id!); setActiveDropdown(null); }}
                                >
                                    {league.image_base64 && <img src={league.image_base64} alt="" />}
                                    <span>{league.name}</span>
                                </div>
                            ))}
                        </div>
                    </FilterDropdown>

                    {selectedLeague && (
                        <FilterDropdown
                            title="Clubes"
                            isOpen={activeDropdown === 'teams'}
                            onClick={() => toggleDropdown('teams')}
                            activeCount={selectedTeam ? 1 : 0}
                            selectedLabel={selectedTeam ? teams.find(t => t.id === selectedTeam)?.name : undefined}
                            onClear={() => { setSelectedTeam(undefined); setPage(1); }}
                        >
                            <div className="filter-list">
                                {teams.map(team => (
                                    <div
                                        key={team.id}
                                        className={`filter-item ${selectedTeam === team.id ? 'active' : ''}`}
                                        onClick={() => { setSelectedTeam(selectedTeam === team.id ? undefined : team.id); setPage(1); setActiveDropdown(null); }}
                                    >
                                        {team.image_base64 && <img src={team.image_base64} alt="" />}
                                        <span>{team.name}</span>
                                    </div>
                                ))}
                            </div>
                        </FilterDropdown>
                    )}

                    <FilterDropdown
                        title="Tipo"
                        isOpen={activeDropdown === 'types'}
                        onClick={() => toggleDropdown('types')}
                        activeCount={selectedType ? 1 : 0}
                        selectedLabel={selectedType ? types.find(t => t.id === selectedType)?.name : undefined}
                        onClear={() => { setSelectedType(undefined); setPage(1); }}
                    >
                        <div className="filter-chips">
                            {types.map(type => (
                                <button
                                    key={type.id}
                                    className={`chip ${selectedType === type.id ? 'active' : ''}`}
                                    onClick={() => { setSelectedType(selectedType === type.id ? undefined : type.id); setPage(1); setActiveDropdown(null); }}
                                >
                                    {type.name}
                                </button>
                            ))}
                        </div>
                    </FilterDropdown>

                    <FilterDropdown
                        title="Cor"
                        isOpen={activeDropdown === 'colors'}
                        onClick={() => toggleDropdown('colors')}
                        activeCount={selectedColor ? 1 : 0}
                        selectedLabel={selectedColor || undefined}
                        onClear={() => { setSelectedColor(''); setPage(1); }}
                    >
                        <div className="filter-list">
                            {colors.map(color => (
                                <div
                                    key={color}
                                    className={`filter-item ${selectedColor === color ? 'active' : ''}`}
                                    onClick={() => { setSelectedColor(selectedColor === color ? '' : color); setPage(1); setActiveDropdown(null); }}
                                >
                                    <span>{color}</span>
                                </div>
                            ))}
                        </div>
                    </FilterDropdown>
                </aside>

                {/* Main Content */}
                <main className="catalog-content">
                    <div className="catalog-controls">
                        <div className="pagination-limit">
                            <span>Itens por página:</span>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="limit-select"
                            >
                                <option value={12}>12</option>
                                <option value={24}>24</option>
                                <option value={36}>36</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loader-container">A carregar...</div>
                    ) : (
                        <>
                            {jerseys.length === 0 ? (
                                <div className="no-results">
                                    <h3>Não foram encontrados resultados.</h3>
                                    <button onClick={() => {
                                        setSelectedLeague(undefined);
                                        setSelectedTeam(undefined);
                                        setSelectedType(undefined);
                                        setSelectedColor('');
                                        setSearch('');
                                    }}>Limpar Filtros</button>
                                </div>
                            ) : (
                                <div className="catalog-grid">
                                    {jerseys.map(jersey => (
                                        <JerseyCard key={jersey.id} jersey={jersey} />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="pagination-btn"
                                    >
                                        <FaChevronLeft /> Anterior
                                    </button>

                                    <div className="page-numbers">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const p = i + 1;
                                            // Simple logic to show limited pages could go here, for now show all if low count
                                            return (
                                                <button
                                                    key={p}
                                                    className={`page-number ${page === p ? 'active' : ''}`}
                                                    onClick={() => setPage(p)}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        className="pagination-btn"
                                    >
                                        Próximo <FaChevronRight />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Catalog;
