/**
 * Query Parser for Wine Search
 * Extracts structured conditions from natural language queries
 */

export interface QueryConditions {
  // 가격 조건
  priceMin?: number
  priceMax?: number

  // 와인 타입
  type?: string  // "Red wine" | "White wine" | "Sparkling wine" | "Rosé wine"

  // 평점
  pointsMin?: number

  // 숫자 속성 (1-5 스케일)
  tanninMin?: number
  tanninMax?: number
  acidityMin?: number
  acidityMax?: number
  sweetnessMin?: number
  sweetnessMax?: number
  bodyMin?: number
  bodyMax?: number

  // ABV (알코올 도수)
  abvMin?: number
  abvMax?: number

  // 국가
  country?: string

  // 품종
  variety?: string

  // 정렬
  sortBy?: 'price' | 'points' | 'tannin' | 'abv' | 'sweetness' | 'acidity' | 'body'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Parse natural language query into structured conditions
 */
export function parseQuery(query: string): QueryConditions {
  const conditions: QueryConditions = {}
  const lowerQuery = query.toLowerCase()

  // ===== 가격 파싱 =====

  // "5만원 이하" 또는 "50000원 이하"
  let match = query.match(/(\d+)만원\s*(이하|미만|까지)/)
  if (match) {
    conditions.priceMax = parseInt(match[1]) * 10000
  } else {
    match = query.match(/(\d+)원\s*(이하|미만|까지)/)
    if (match) {
      conditions.priceMax = parseInt(match[1])
    }
  }

  // "3만원 이상" 또는 "30000원 이상"
  match = query.match(/(\d+)만원\s*(이상|부터|넘는)/)
  if (match) {
    conditions.priceMin = parseInt(match[1]) * 10000
  } else {
    match = query.match(/(\d+)원\s*(이상|부터|넘는)/)
    if (match) {
      conditions.priceMin = parseInt(match[1])
    }
  }

  // "3만원에서 5만원" 또는 "3-5만원"
  match = query.match(/(\d+)만원\s*(에서|~|-)\s*(\d+)만원/)
  if (match) {
    conditions.priceMin = parseInt(match[1]) * 10000
    conditions.priceMax = parseInt(match[3]) * 10000
  }

  // ===== 와인 타입 파싱 =====

  if (lowerQuery.includes('레드') || lowerQuery.includes('red') || lowerQuery.includes('빨간') || lowerQuery.includes('적포도주')) {
    conditions.type = 'Red wine'
  } else if (lowerQuery.includes('화이트') || lowerQuery.includes('white') || lowerQuery.includes('흰') || lowerQuery.includes('백포도주')) {
    conditions.type = 'White wine'
  } else if (lowerQuery.includes('스파클링') || lowerQuery.includes('샴페인') || lowerQuery.includes('sparkling') || lowerQuery.includes('스파클')) {
    conditions.type = 'Sparkling wine'
  } else if (lowerQuery.includes('로제') || lowerQuery.includes('rosé') || lowerQuery.includes('rose')) {
    conditions.type = 'Rosé wine'
  }

  // ===== 탄닌 파싱 =====

  if (lowerQuery.includes('탄닌')) {
    if (lowerQuery.includes('낮은') || lowerQuery.includes('약한') || lowerQuery.includes('적은') || lowerQuery.includes('부드러운')) {
      conditions.tanninMax = 2
    } else if (lowerQuery.includes('높은') || lowerQuery.includes('강한') || lowerQuery.includes('많은') || lowerQuery.includes('진한')) {
      conditions.tanninMin = 4
    } else if (lowerQuery.includes('중간') || lowerQuery.includes('보통')) {
      conditions.tanninMin = 3
      conditions.tanninMax = 3
    }
  }

  // ===== 당도 파싱 =====

  if (lowerQuery.includes('달콤') || lowerQuery.includes('단') || lowerQuery.includes('sweet')) {
    conditions.sweetnessMin = 4
  } else if (lowerQuery.includes('드라이') || lowerQuery.includes('안단') || lowerQuery.includes('dry')) {
    conditions.sweetnessMax = 2
  } else if (lowerQuery.includes('세미 드라이') || lowerQuery.includes('오프 드라이')) {
    conditions.sweetnessMin = 2
    conditions.sweetnessMax = 3
  }

  // ===== 바디 파싱 =====

  if (lowerQuery.includes('풀바디') || lowerQuery.includes('full body') || lowerQuery.includes('진한')) {
    conditions.bodyMin = 4
  } else if (lowerQuery.includes('라이트 바디') || lowerQuery.includes('light body') || lowerQuery.includes('가벼운')) {
    conditions.bodyMax = 2
  } else if (lowerQuery.includes('미디엄 바디') || lowerQuery.includes('medium body')) {
    conditions.bodyMin = 3
    conditions.bodyMax = 3
  }

  // ===== 산도 파싱 =====

  if (lowerQuery.includes('산도')) {
    if (lowerQuery.includes('높은') || lowerQuery.includes('강한') || lowerQuery.includes('상큼')) {
      conditions.acidityMin = 4
    } else if (lowerQuery.includes('낮은') || lowerQuery.includes('부드러운')) {
      conditions.acidityMax = 2
    }
  }

  // ===== ABV (알코올 도수) 파싱 =====

  if (lowerQuery.includes('알코올') || lowerQuery.includes('도수') || lowerQuery.includes('abv')) {
    if (lowerQuery.includes('높은') || lowerQuery.includes('강한')) {
      conditions.abvMin = 14
    } else if (lowerQuery.includes('낮은') || lowerQuery.includes('약한')) {
      conditions.abvMax = 12
    }
  }

  // ===== 평점 파싱 =====

  match = query.match(/평점\s*(\d+)점\s*이상/)
  if (match) {
    conditions.pointsMin = parseInt(match[1])
  } else if (lowerQuery.includes('평점 높은') || lowerQuery.includes('고평점')) {
    conditions.pointsMin = 4
  }

  // ===== 국가 파싱 =====

  const countryMap: Record<string, string> = {
    '프랑스': 'France',
    'france': 'France',
    '이탈리아': 'Italy',
    'italy': 'Italy',
    '스페인': 'Spain',
    'spain': 'Spain',
    '칠레': 'Chile',
    'chile': 'Chile',
    '미국': 'United States',
    '아르헨티나': 'Argentina',
    'argentina': 'Argentina',
    '호주': 'Australia',
    'australia': 'Australia',
    '뉴질랜드': 'New Zealand',
    '독일': 'Germany',
    '포르투갈': 'Portugal',
  }

  for (const [keyword, country] of Object.entries(countryMap)) {
    if (lowerQuery.includes(keyword)) {
      conditions.country = country
      break
    }
  }

  // ===== 품종 파싱 =====

  const varietyMap: Record<string, string> = {
    '카베르네': 'Cabernet',
    'cabernet': 'Cabernet',
    '메를로': 'Merlot',
    'merlot': 'Merlot',
    '피노': 'Pinot',
    'pinot': 'Pinot',
    '샤르도네': 'Chardonnay',
    'chardonnay': 'Chardonnay',
    '소비뇽': 'Sauvignon',
    'sauvignon': 'Sauvignon',
    '쉬라즈': 'Shiraz',
    'shiraz': 'Shiraz',
    '시라': 'Syrah',
    'syrah': 'Syrah',
  }

  for (const [keyword, variety] of Object.entries(varietyMap)) {
    if (lowerQuery.includes(keyword)) {
      conditions.variety = variety
      break
    }
  }

  // ===== 정렬 파싱 =====

  if (lowerQuery.includes('가장 비싼') || lowerQuery.includes('최고가') || lowerQuery.includes('고가')) {
    conditions.sortBy = 'price'
    conditions.sortOrder = 'desc'
  } else if (lowerQuery.includes('가장 싼') || lowerQuery.includes('저렴한') || lowerQuery.includes('최저가') || lowerQuery.includes('싼')) {
    conditions.sortBy = 'price'
    conditions.sortOrder = 'asc'
  } else if (lowerQuery.includes('평점 높은') || lowerQuery.includes('최고 평점') || lowerQuery.includes('고평점')) {
    conditions.sortBy = 'points'
    conditions.sortOrder = 'desc'
  } else if (lowerQuery.includes('도수 높은') || lowerQuery.includes('알코올 높은')) {
    conditions.sortBy = 'abv'
    conditions.sortOrder = 'desc'
  } else if (lowerQuery.includes('도수 낮은') || lowerQuery.includes('알코올 낮은')) {
    conditions.sortBy = 'abv'
    conditions.sortOrder = 'asc'
  }

  return conditions
}

/**
 * Check if query has any structured conditions
 */
export function hasConditions(conditions: QueryConditions): boolean {
  return Object.keys(conditions).length > 0
}

/**
 * Format conditions for logging
 */
export function formatConditions(conditions: QueryConditions): string {
  const parts: string[] = []

  if (conditions.priceMin !== undefined) parts.push(`가격≥${conditions.priceMin}`)
  if (conditions.priceMax !== undefined) parts.push(`가격≤${conditions.priceMax}`)
  if (conditions.type) parts.push(`타입=${conditions.type}`)
  if (conditions.pointsMin !== undefined) parts.push(`평점≥${conditions.pointsMin}`)
  if (conditions.tanninMin !== undefined) parts.push(`탄닌≥${conditions.tanninMin}`)
  if (conditions.tanninMax !== undefined) parts.push(`탄닌≤${conditions.tanninMax}`)
  if (conditions.sweetnessMin !== undefined) parts.push(`당도≥${conditions.sweetnessMin}`)
  if (conditions.sweetnessMax !== undefined) parts.push(`당도≤${conditions.sweetnessMax}`)
  if (conditions.bodyMin !== undefined) parts.push(`바디≥${conditions.bodyMin}`)
  if (conditions.bodyMax !== undefined) parts.push(`바디≤${conditions.bodyMax}`)
  if (conditions.acidityMin !== undefined) parts.push(`산도≥${conditions.acidityMin}`)
  if (conditions.acidityMax !== undefined) parts.push(`산도≤${conditions.acidityMax}`)
  if (conditions.abvMin !== undefined) parts.push(`ABV≥${conditions.abvMin}%`)
  if (conditions.abvMax !== undefined) parts.push(`ABV≤${conditions.abvMax}%`)
  if (conditions.country) parts.push(`국가=${conditions.country}`)
  if (conditions.variety) parts.push(`품종=${conditions.variety}`)
  if (conditions.sortBy) parts.push(`정렬=${conditions.sortBy} ${conditions.sortOrder}`)

  return parts.length > 0 ? parts.join(', ') : '없음'
}
