import { supabase } from '../db/supabase'
import type { Wine, InventoryLocation } from '../types'

/**
 * 와인 목록 조회 (필터링 지원)
 */
export async function getWines(filters?: {
  type?: string
  country?: string
  variety?: string
  minPrice?: number
  maxPrice?: number
  search?: string
}): Promise<Wine[]> {
  let query = supabase
    .from('wines')
    .select('*')
    .order('title')

  // 타입 필터
  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  // 국가 필터
  if (filters?.country && filters.country !== 'all') {
    query = query.eq('country', filters.country)
  }

  // 품종 필터 (대소문자 구분 없이, 블랜드 안에 있어도 포함)
  if (filters?.variety && filters.variety !== 'all') {
    query = query.ilike('variety', `%${filters.variety}%`)
  }

  // 가격 필터
  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }

  // 검색 (와인명 또는 와이너리)
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,winery.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error

  // 각 와인의 재고 위치 정보 가져오기
  const wines = (data || []) as Wine[]
  const winesWithLocations = await Promise.all(
    wines.map(async (wine) => {
      const { data: inventory } = await supabase
        .from('inventory')
        .select('shelf, row, col')
        .eq('wine_id', wine.id)
        .order('shelf')
        .order('row')
        .order('col')

      return {
        ...wine,
        locations: inventory as InventoryLocation[] || []
      }
    })
  )

  return winesWithLocations
}

/**
 * 와인 상세 조회 (ID)
 */
export async function getWineById(id: number): Promise<Wine | null> {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null  // Not found
    throw error
  }

  return data as Wine
}

/**
 * 최고 가격 조회
 */
export async function getMaxPrice(): Promise<number> {
  const { data, error } = await supabase
    .from('wines')
    .select('price')
    .order('price', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data?.price || 100000
}
