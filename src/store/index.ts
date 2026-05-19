import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

export interface CartItemState {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItemState[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: "shop-cart" }
  )
);

interface UIStore {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  balance: number;
  rank: string;
  role: string;
}

interface UserStore {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  updateBalance: (newBalance: number) => void;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateBalance: (newBalance) =>
    set((state) => ({
      user: state.user ? { ...state.user, balance: newBalance } : null,
    })),
  fetchUser: async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data });
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    }
  },
}));

export interface PublicSettings {
  store_name: string;
  store_email: string;
  store_hotline: string;
  bank_name: string;
  bank_bin: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_qr_image: string;
  momo_account_number: string;
  momo_account_name: string;
  momo_qr_image: string;
  telegram: string;
  zalo: string;
  facebook: string;
  description: string;
  keywords: string;
  facebook_pixel: string;
  google_analytics: string;
}

interface SettingsStore {
  settings: PublicSettings;
  setSettings: (s: PublicSettings) => void;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    store_name: "ShopAccount",
    store_email: "support@shopaccount.vn",
    store_hotline: "0901 234 567",
    bank_name: "TP Bank",
    bank_bin: "970423",
    bank_account_number: "07553046301",
    bank_account_name: "NGUYEN MINH TUNG",
    bank_qr_image: "",
    momo_account_number: "",
    momo_account_name: "",
    momo_qr_image: "",
    telegram: "",
    zalo: "",
    facebook: "",
    description: "",
    keywords: "",
    facebook_pixel: "",
    google_analytics: "",
  },
  setSettings: (s) => set({ settings: s }),
  fetchSettings: async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        set({ settings: data as PublicSettings });
      }
    } catch {
      // ignore
    }
  },
}));
