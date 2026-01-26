import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Jersey } from '../services/catalog.service';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext';

export interface CartItem {
    id?: number; // Database ID (optional for guest)
    jersey: Jersey;
    size: string;
    quantity: number;
    customName?: string;
    customNumber?: string;
    patches?: string[];
    finalPrice: number; // Price per item including extras
}

interface CartContextType {
    items: CartItem[];
    addToCart: (jersey: Jersey, size: string, customName?: string, customNumber?: string, patches?: string[]) => void;
    removeFromCart: (jerseyId: number, size: string, customName?: string, customNumber?: string, patches?: string[]) => void;
    clearCart: () => void;
    toggleCart: () => void;
    isCartOpen: boolean;
    totalItems: number;
    subtotal: number;
    discountPerItem: number;
    totalDiscount: number;
    finalTotal: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();

    // Helper to get correct key for guest
    const guestKey = 'cart_guest';

    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initial load and sync on user change
    useEffect(() => {
        const loadCart = async () => {
            setIsLoading(true);
            if (isAuthenticated) {
                try {
                    const dbItems = await cartService.getCart();
                    const mappedItems: CartItem[] = dbItems.map(i => ({
                        id: i.id,
                        jersey: i.jersey,
                        size: i.size,
                        quantity: i.quantity,
                        customName: i.custom_name,
                        customNumber: i.custom_number,
                        patches: i.patches,
                        finalPrice: i.final_price
                    }));
                    setItems(mappedItems);
                } catch (error) {
                    console.error("Failed to load cart from DB", error);
                }
            } else {
                // Load guest cart
                const saved = localStorage.getItem(guestKey);
                if (saved) {
                    setItems(JSON.parse(saved));
                } else {
                    setItems([]);
                }
            }
            setIsLoading(false);
        };
        loadCart();
    }, [isAuthenticated]);

    // Save to local storage only if guest
    useEffect(() => {
        if (!isAuthenticated) {
            try {
                localStorage.setItem(guestKey, JSON.stringify(items));
            } catch (error) {
                console.error("Failed to save cart to localStorage (Quota exceeded?)", error);
                // Optional: Attempt to clear or manage, but for now just prevent crash
            }
        }
    }, [items, isAuthenticated]);

    const addToCart = async (jersey: Jersey, size: string, customName?: string, customNumber?: string, patches: string[] = []) => {
        const basePrice = jersey.jersey_type?.current_price || 0;
        const extraCost = (customName || customNumber) ? 3 : 0;
        const patchesCost = patches.length * 2;
        const finalPrice = basePrice + extraCost + patchesCost;

        if (isAuthenticated) {
            // API Call
            try {
                if (!jersey.id) return; // Should not happen
                await cartService.addToCart({
                    jersey_id: jersey.id,
                    size,
                    quantity: 1,
                    custom_name: customName,
                    custom_number: customNumber,
                    patches,
                    final_price: finalPrice
                });
                // Refresh cart
                const dbItems = await cartService.getCart();
                const mappedItems: CartItem[] = dbItems.map(i => ({
                    id: i.id,
                    jersey: i.jersey,
                    size: i.size,
                    quantity: i.quantity,
                    customName: i.custom_name,
                    customNumber: i.custom_number,
                    patches: i.patches,
                    finalPrice: i.final_price
                }));
                setItems(mappedItems);
            } catch (error) {
                console.error("Error adding to cart DB", error);
            }
        } else {
            // Local Logic
            setItems(prev => {
                const existing = prev.find(item =>
                    item.jersey.id === jersey.id &&
                    item.size === size &&
                    item.customName === customName &&
                    item.customNumber === customNumber &&
                    JSON.stringify(item.patches?.sort()) === JSON.stringify(patches.sort())
                );

                if (existing) {
                    return prev.map(item =>
                        item === existing
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return [...prev, { jersey, size, quantity: 1, customName, customNumber, patches, finalPrice }];
            });
        }
        setIsCartOpen(true);
    };

    const removeFromCart = async (jerseyId: number, size: string, customName?: string, customNumber?: string, patches: string[] = []) => {
        if (isAuthenticated) {
            // Find item to get its DB ID
            const targetItem = items.find(item =>
                item.jersey.id === jerseyId &&
                item.size === size &&
                item.customName === customName &&
                item.customNumber === customNumber &&
                JSON.stringify(item.patches?.sort()) === JSON.stringify(patches.sort())
            );

            if (targetItem && targetItem.id) {
                try {
                    await cartService.removeFromCart(targetItem.id);
                    // Refresh
                    const dbItems = await cartService.getCart();
                    setItems(dbItems.map(i => ({
                        id: i.id,
                        jersey: i.jersey,
                        size: i.size,
                        quantity: i.quantity,
                        customName: i.custom_name,
                        customNumber: i.custom_number,
                        patches: i.patches,
                        finalPrice: i.final_price
                    })));
                } catch (e) {
                    console.error("Error removing from DB cart", e);
                }
            }
        } else {
            setItems(prev => prev.filter(item => !(
                item.jersey.id === jerseyId &&
                item.size === size &&
                item.customName === customName &&
                item.customNumber === customNumber &&
                JSON.stringify(item.patches?.sort()) === JSON.stringify(patches.sort())
            )));
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            await cartService.clearCart();
            setItems([]);
        } else {
            setItems([]);
        }
    };

    const toggleCart = () => setIsCartOpen(prev => !prev);

    // Derived state
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const subtotal = items.reduce((sum, item) => {
        return sum + (item.finalPrice * item.quantity);
    }, 0);

    // Discount Logic
    // 3-5 items: -3€/item
    // 6-8 items: -6€/item
    // 9+ items: -9€/item
    let discountPerItem = 0;
    if (totalItems >= 9) {
        discountPerItem = 9;
    } else if (totalItems >= 6) {
        discountPerItem = 6;
    } else if (totalItems >= 3) {
        discountPerItem = 3;
    }

    const totalDiscount = totalItems * discountPerItem;
    const finalTotal = Math.max(0, subtotal - totalDiscount);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            clearCart,
            toggleCart,
            isCartOpen,
            totalItems,
            subtotal,
            discountPerItem,
            totalDiscount,
            finalTotal,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
