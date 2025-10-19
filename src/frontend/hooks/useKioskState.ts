import { create } from 'zustand'
import type { Wine } from '../../types'

interface KioskState {
  // 비활성 상태
  isIdle: boolean
  setIsIdle: (isIdle: boolean) => void

  // 마지막 활동 시간
  lastActivity: number
  updateActivity: () => void

  // 필터 상태
  filters: {
    type: string
    country: string
    search: string
  }
  setFilters: (filters: Partial<KioskState['filters']>) => void
  resetFilters: () => void

  // 장바구니
  cart: Wine[]
  addToCart: (wine: Wine) => void
  removeFromCart: (wineId: number) => void
  clearCart: () => void

  // 장바구니 모달
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
}

export const useKioskState = create<KioskState>((set) => ({
  isIdle: false,
  setIsIdle: (isIdle) => set({ isIdle }),

  lastActivity: Date.now(),
  updateActivity: () => set({ lastActivity: Date.now() }),

  filters: {
    type: 'all',
    country: 'all',
    search: '',
  },
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  resetFilters: () => set({
    filters: { type: 'all', country: 'all', search: '' }
  }),

  cart: [],
  addToCart: (wine) => set((state) => ({
    cart: [...state.cart, wine]
  })),
  removeFromCart: (wineId) => set((state) => ({
    cart: state.cart.filter(wine => wine.id !== wineId)
  })),
  clearCart: () => set({ cart: [] }),

  isCartOpen: false,
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
}))
