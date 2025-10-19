import { supabase } from '../db/supabase'
import type { Inventory } from '../types'

/**
 * 와인의 재고 위치 조회
 */
export async function getInventoryByWineId(wineId: number): Promise<Inventory[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('wine_id', wineId)
    .order('shelf')
    .order('row')
    .order('col')

  if (error) throw error
  return (data || []) as Inventory[]
}
