import { useQuery } from '@tanstack/react-query'
import type { Inventory } from '../../types'

export function useInventory(wineId: string | number) {
  return useQuery({
    queryKey: ['inventory', wineId],
    queryFn: async () => {
      const response = await fetch(`/api/inventory/${wineId}`)
      if (!response.ok) throw new Error('Failed to fetch inventory')

      return response.json() as Promise<Inventory[]>
    },
    enabled: !!wineId,
  })
}
