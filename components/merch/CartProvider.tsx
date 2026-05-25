'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'ff-merch-cart';

export type CartItem = {
  productId: number;
  productTitle: string;
  variantIndex: number;
  variantLabel: string;
  priceCzk: number;
  coverImageUrl: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number, variantIndex: number) => void;
  updateQuantity: (
    productId: number,
    variantIndex: number,
    quantity: number,
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.productId === 'number' &&
    typeof obj.productTitle === 'string' &&
    typeof obj.variantIndex === 'number' &&
    typeof obj.variantLabel === 'string' &&
    typeof obj.priceCzk === 'number' &&
    Number.isFinite(obj.priceCzk) &&
    typeof obj.quantity === 'number' &&
    Number.isFinite(obj.quantity) &&
    obj.quantity > 0
  );
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCartItem);
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export function CartProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((incoming: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) =>
          i.productId === incoming.productId &&
          i.variantIndex === incoming.variantIndex,
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {...updated[idx], quantity: updated[idx].quantity + 1};
        return updated;
      }
      return [...prev, {...incoming, quantity: 1}];
    });
  }, []);

  const removeItem = useCallback((productId: number, variantIndex: number) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.variantIndex === variantIndex),
      ),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: number, variantIndex: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantIndex);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.variantIndex === variantIndex
            ? {...i, quantity}
            : i,
        ),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.priceCzk * i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
