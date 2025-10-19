// Wine 타입 (WMS와 동일)
export interface Wine {
  id: number
  title: string
  points: number | null
  vintage: number | null
  type: 'Red wine' | 'White wine' | 'Rosé wine' | 'Sparkling wine' | 'Dessert wine' | null
  variety: string | null
  region_2: string | null
  region_1: string | null
  province: string | null
  country: string | null
  winery: string | null
  price: number | null
  abv: number | null
  description: string | null
  taste: string | null
  acidity: number | null
  sweetness: number | null
  tannin: number | null
  body: number | null
  cost_effectiveness: number | null
  image: string | null
  vivino_url: string | null
  stock: number
  created_at: string
  updated_at: string
  locations?: InventoryLocation[]  // 재고 위치 정보
}

// 재고 위치 정보
export interface InventoryLocation {
  shelf: 'A' | 'B' | 'C'
  row: number  // 1-8
  col: number  // 1-4
}

// Inventory 타입 (WMS와 동일)
export interface Inventory {
  id: number
  wine_id: number
  shelf: 'A' | 'B' | 'C'
  row: number  // 1-8
  col: number  // 1-4
  created_at: string
}
