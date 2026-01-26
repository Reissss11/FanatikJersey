import api from './api';

export interface Address {
    id?: number;
    first_name: string;
    last_name: string;
    country: string;
    street_address: string;
    district: string;
    city: string;
    postal_code: string;
    phone_number: string;
    email: string;
}

export interface UserInfo {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
}

export const profileService = {
    async getProfile() {
        const response = await api.get('/profile/me');
        return response.data;
    },

    async updateInfo(data: { first_name: string; last_name: string; email: string; username: string }) {
        const response = await api.put('/profile/me/info', data);
        return response.data;
    },

    async changePassword(data: { old_password: string; new_password: string; confirm_password: string }) {
        const response = await api.put('/profile/me/password', data);
        return response.data;
    },

    async uploadImage(base64Image: string) {
        const response = await api.post('/profile/me/image', { image_data: base64Image });
        return response.data;
    },

    async addAddress(address: Address) {
        const response = await api.post('/profile/me/address', address);
        return response.data;
    },

    async updateAddress(id: number, address: Address) {
        const response = await api.put(`/profile/me/address/${id}`, address);
        return response.data;
    },

    async deleteAddress(id: number) {
        const response = await api.delete(`/profile/me/address/${id}`);
        return response.data;
    }
};
