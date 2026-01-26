import api from './api';

// Types
export interface League {
    id?: number;
    name: string;
    image_base64?: string;
}

export interface Team {
    id?: number;
    name: string;
    league_id: number;
    league_name?: string;
    image_base64?: string;
}

export interface JerseyImage {
    id?: number;
    image_base64: string;
    is_main: boolean;
}

export interface JerseyType {
    id?: number;
    name: string;
    original_price: number;
    current_price: number;
    description?: string;
}

export interface Jersey {
    id?: number;
    team_id: number;
    team_name?: string;
    season: string;
    // jersey_type: string; // Removed
    jersey_type_id: number; // Added
    jersey_type?: JerseyType; // Added for display
    main_color: string;
    // price: number; // Removed
    description?: string;
    images: JerseyImage[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    total_pages: number;
}

export const catalogService = {
    // ... (Leagues, Teams, Types remain same)

    // Leagues
    async getLeagues() {
        const response = await api.get('/catalog/leagues');
        return response.data;
    },
    async createLeague(data: League) {
        const response = await api.post('/catalog/leagues', data);
        return response.data;
    },
    async deleteLeague(id: number) {
        const response = await api.delete(`/catalog/leagues/${id}`);
        return response.data;
    },

    // Teams
    async getTeams(leagueId?: number) {
        const url = leagueId ? `/catalog/teams?league_id=${leagueId}` : '/catalog/teams';
        const response = await api.get(url);
        return response.data;
    },
    async createTeam(data: Team) {
        const response = await api.post('/catalog/teams', data);
        return response.data;
    },
    async deleteTeam(id: number) {
        const response = await api.delete(`/catalog/teams/${id}`);
        return response.data;
    },

    // Jersey Types
    async getTypes() {
        const response = await api.get('/catalog/types');
        return response.data;
    },
    async createType(data: JerseyType) {
        const response = await api.post('/catalog/types', data);
        return response.data;
    },
    async updateType(id: number, data: JerseyType) {
        const response = await api.put(`/catalog/types/${id}`, data);
        return response.data;
    },
    async deleteType(id: number) {
        const response = await api.delete(`/catalog/types/${id}`);
        return response.data;
    },

    // Jerseys
    async getJerseys(
        filters?: {
            team_id?: number;
            league_id?: number;
            jersey_type_id?: number;
            main_color?: string;
            search?: string;
        },
        pagination?: {
            page?: number;
            limit?: number;
            sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
        }
    ): Promise<PaginatedResponse<Jersey>> {
        let url = '/catalog/jerseys?';

        if (filters?.team_id) url += `team_id=${filters.team_id}&`;
        if (filters?.league_id) url += `league_id=${filters.league_id}&`;
        if (filters?.jersey_type_id) url += `jersey_type_id=${filters.jersey_type_id}&`;
        if (filters?.main_color) url += `main_color=${encodeURIComponent(filters.main_color)}&`;
        if (filters?.search) url += `search=${encodeURIComponent(filters.search)}&`;

        if (pagination?.page) url += `page=${pagination.page}&`;
        if (pagination?.limit) url += `limit=${pagination.limit}&`;
        if (pagination?.sortBy) url += `sort_by=${pagination.sortBy}&`;

        const response = await api.get(url);
        return response.data;
    },
    async getJersey(id: number) {
        const response = await api.get(`/catalog/jerseys/${id}`);
        return response.data;
    },
    async createJersey(data: Jersey) {
        const response = await api.post('/catalog/jerseys', data);
        return response.data;
    },
    async updateJersey(id: number, data: Jersey) {
        // Backend maps PUT /catalog/jerseys/{id}
        // Note: Check backend router if PUT is implemented, if not I might need to implement it there too. 
        // Checking Controller... wait, the plan assumed I only needed frontend changes but let me double check backend controller.
        // Actually, looking at previous file view of CatalogRoutes.py (step 34), I see create, get, delete, but NO update for jerseys!
        // I missed this in the plan. I need to add PUT endpoint to backend as well.
        // I will add the frontend call now, and then immediately fixing backend.
        const response = await api.put(`/catalog/jerseys/${id}`, data);
        return response.data;
    },
    async deleteJersey(id: number) {
        const response = await api.delete(`/catalog/jerseys/${id}`);
        return response.data;
    }
};
