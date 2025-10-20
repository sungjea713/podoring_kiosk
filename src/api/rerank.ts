import { CohereClient } from 'cohere-ai'
import type { Wine } from '../types'

const cohere = new CohereClient({
  token: Bun.env.COHERE_API_KEY!
})

/**
 * Cohere Rerank API를 사용하여 와인 목록을 재순위화
 * @param query - 사용자 검색 쿼리 (영어)
 * @param wines - 재순위화할 와인 목록
 * @param topN - 상위 N개 와인 반환 (기본값: 3)
 * @returns 재순위화된 와인 목록
 */
export async function rerankWines(
  query: string,
  wines: Wine[],
  topN: number = 3
): Promise<Wine[]> {
  if (wines.length === 0) {
    return []
  }

  try {
    // 와인 정보를 텍스트로 변환
    const documents = wines.map(wine => {
      const parts = [
        wine.title,
        wine.type,
        wine.variety,
        wine.country,
        wine.winery,
        wine.description,
        wine.taste
      ].filter(Boolean) // null/undefined 제거

      return parts.join(' ')
    })

    // Cohere Rerank API 호출
    const response = await cohere.rerank({
      model: 'rerank-english-v3.0',
      query,
      documents,
      topN: Math.min(topN, wines.length)
    })

    // 재순위화된 와인 반환
    return response.results.map(result => wines[result.index])
  } catch (error) {
    console.error('Error reranking wines:', error)
    // Rerank 실패 시 원본 와인 목록의 처음 N개 반환
    return wines.slice(0, topN)
  }
}
