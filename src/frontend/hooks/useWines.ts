import { useQuery } from '@tanstack/react-query'
import type { Wine } from '../../types'

export function useWines(filters?: {
  type?: string
  country?: string
  variety?: string
  search?: string
  minPrice?: number
  maxPrice?: number
}) {
  return useQuery({
    queryKey: ['wines', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters?.type && filters.type !== 'all') {
        params.set('type', filters.type)
      }
      if (filters?.country && filters.country !== 'all') {
        params.set('country', filters.country)
      }
      if (filters?.variety && filters.variety !== 'all') {
        params.set('variety', filters.variety)
      }
      if (filters?.search) {
        params.set('search', filters.search)
      }
      if (filters?.minPrice !== undefined) {
        params.set('minPrice', filters.minPrice.toString())
      }
      if (filters?.maxPrice !== undefined) {
        params.set('maxPrice', filters.maxPrice.toString())
      }

      const response = await fetch(`/api/wines?${params}`)
      if (!response.ok) throw new Error('Failed to fetch wines')

      return response.json() as Promise<Wine[]>
    }
  })
}

export function useMaxPrice() {
  return useQuery({
    queryKey: ['maxPrice'],
    queryFn: async () => {
      const response = await fetch('/api/wines/max-price')
      if (!response.ok) throw new Error('Failed to fetch max price')
      const data = await response.json()
      return data.maxPrice as number
    },
    staleTime: Infinity, // 최고 가격은 자주 변하지 않음
  })
}

export function useWine(id: string | number) {
  return useQuery({
    queryKey: ['wine', id],
    queryFn: async () => {
      const response = await fetch(`/api/wines/${id}`)
      if (!response.ok) throw new Error('Failed to fetch wine')

      return response.json() as Promise<Wine>
    },
    enabled: !!id,
  })
}
