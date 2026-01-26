import api from './api';
import type { Jersey } from './catalog.service';

export interface CartItemResponse {
    id: number;
    jersey_id: number;
    jersey: Jersey;
    size: string;
    quantity: number;
    custom_name?: string;
    custom_number?: string;
    patches?: string[];
    final_price: number;
}

export interface AddToCartRequest {
    jersey_id: number;
    size: string;
    quantity: number;
    custom_name?: string;
    custom_number?: string;
    patches?: string[];
    final_price: number;
}

export const cartService = {
    getCart: async (): Promise<CartItemResponse[]> => {
        const response = await api.get('/cart');
        return response.data;
    },

    addToCart: async (item: AddToCartRequest): Promise<CartItemResponse> => {
        const response = await api.post('/cart', item);
        return response.data;
    },

    removeFromCart: async (itemId: number): Promise<void> => {
        await api.delete(`/cart/${itemId}`);
    },

    clearCart: async (): Promise<void> => {
        await api.delete('/cart');
    }
};
