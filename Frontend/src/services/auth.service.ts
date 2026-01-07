import api from './api';

export const authService = {
    async login(data: any) {
        const response = await api.post('/auth/login', data);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response.data;
    },

    async register(data: any) {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
    },

    getCurrentUser() {
        // This is a placeholder. Without a dedicated "me" endpoint or decoding the token, 
        // we can just check if a token exists for now.
        return localStorage.getItem('token');
    }
};
