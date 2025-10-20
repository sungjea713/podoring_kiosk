import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: Bun.env.OPENAI_API_KEY
})

/**
 * OpenAI API를 사용하여 쿼리 텍스트를 임베딩 벡터로 변환
 * @param query - 검색 쿼리 (영어)
 * @returns 1536차원 임베딩 벡터
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      dimensions: 1536
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error(`Failed to generate embedding: ${error}`)
  }
}
