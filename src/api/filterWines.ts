import { supabase } from '../db/supabase'
import type { Wine } from '../types'
import type { QueryConditions } from './queryParser'

/**
 * Filter wines based on parsed query conditions
 */
export async function filterWines(conditions: QueryConditions): Promise<Wine[]> {
  let query = supabase.from('wines').select('*')

  // ===== 가격 필터 =====
  if (conditions.priceMin !== undefined) {
    query = query.gte('price', conditions.priceMin)
  }
  if (conditions.priceMax !== undefined) {
    query = query.lte('price', conditions.priceMax)
  }

  // ===== 와인 타입 필터 =====
  if (conditions.type) {
    query = query.eq('type', conditions.type)
  }

  // ===== 평점 필터 =====
  if (conditions.pointsMin !== undefined) {
    query = query.gte('points', conditions.pointsMin)
  }

  // ===== 탄닌 필터 =====
  if (conditions.tanninMin !== undefined) {
    query = query.gte('tannin', conditions.tanninMin)
  }
  if (conditions.tanninMax !== undefined) {
    query = query.lte('tannin', conditions.tanninMax)
  }

  // ===== 산도 필터 =====
  if (conditions.acidityMin !== undefined) {
    query = query.gte('acidity', conditions.acidityMin)
  }
  if (conditions.acidityMax !== undefined) {
    query = query.lte('acidity', conditions.acidityMax)
  }

  // ===== 당도 필터 =====
  if (conditions.sweetnessMin !== undefined) {
    query = query.gte('sweetness', conditions.sweetnessMin)
  }
  if (conditions.sweetnessMax !== undefined) {
    query = query.lte('sweetness', conditions.sweetnessMax)
  }

  // ===== 바디 필터 =====
  if (conditions.bodyMin !== undefined) {
    query = query.gte('body', conditions.bodyMin)
  }
  if (conditions.bodyMax !== undefined) {
    query = query.lte('body', conditions.bodyMax)
  }

  // ===== ABV 필터 =====
  if (conditions.abvMin !== undefined) {
    query = query.gte('abv', conditions.abvMin)
  }
  if (conditions.abvMax !== undefined) {
    query = query.lte('abv', conditions.abvMax)
  }

  // ===== 국가 필터 =====
  if (conditions.country) {
    query = query.ilike('country', `%${conditions.country}%`)
  }

  // ===== 품종 필터 =====
  if (conditions.variety) {
    query = query.ilike('variety', `%${conditions.variety}%`)
  }

  // ===== 정렬 =====
  if (conditions.sortBy) {
    query = query.order(conditions.sortBy, {
      ascending: conditions.sortOrder === 'asc'
    })
  } else {
    // 기본 정렬: 평점 높은 순
    query = query.order('points', { ascending: false })
  }

  // 최대 100개 제한 (너무 많으면 재랭킹 느려짐)
  query = query.limit(100)

  const { data, error } = await query

  if (error) {
    console.error('Filter wines error:', error)
    throw error
  }

  return data || []
}
