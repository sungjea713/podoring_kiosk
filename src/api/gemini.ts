import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Wine } from '../types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

interface GeminiRecommendation {
  id: number
  reason: string
}

interface GeminiResponse {
  recommendations: GeminiRecommendation[]
}

export async function getGeminiRecommendations(
  query: string,
  wines: Wine[],
  limit: number
): Promise<GeminiRecommendation[]> {
  // 와인 데이터를 Gemini용으로 간소화
  const winesForLLM = wines.map(wine => ({
    id: wine.id,
    title: wine.title,
    vintage: wine.vintage,
    type: wine.type,
    variety: wine.variety,
    country: wine.country,
    winery: wine.winery,
    price: wine.price,
    abv: wine.abv,
    points: wine.points,
    description: wine.description,
    taste: wine.taste
  }))

  const prompt = `당신은 전문 소믈리에입니다. 아래 와인 목록에서 사용자의 요청에 가장 적합한 와인을 정확히 ${limit}개 추천해주세요.

# 사용자 요청
${query}

# 와인 목록
${JSON.stringify(winesForLLM, null, 2)}

# 추천 기준
1. 사용자의 취향과 용도를 정확히 분석
2. 음식 페어링 고려 (언급된 경우)
3. 가격대 고려 (언급된 경우)
4. 와인 타입, 품종, 원산지의 특성 고려
5. 평점(points)과 전문가 설명(description) 참고

# 응답 형식 (JSON만 출력, 다른 텍스트 없이)
{
  "recommendations": [
    {
      "id": 와인ID(숫자),
      "reason": "이 와인을 추천하는 구체적인 이유 (2-3문장, 한국어)"
    }
  ]
}

중요: 정확히 ${limit}개만 추천하고, 반드시 위 JSON 형식으로만 응답하세요.`

  console.log(`🤖 Sending request to Gemini...`)

  const result = await model.generateContent(prompt)
  const response = result.response.text()

  console.log(`✓ Gemini response received (${response.length} chars)`)

  // JSON 파싱 (```json ... ``` 또는 순수 JSON 형식)
  let jsonText = response

  // 코드 블록 제거
  const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1]
  } else {
    // 순수 JSON 추출
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }
  }

  try {
    const parsed: GeminiResponse = JSON.parse(jsonText)

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid response format: missing recommendations array')
    }

    // 정확히 limit개만 반환 (Gemini가 더 많이 반환할 수도 있음)
    return parsed.recommendations.slice(0, limit)
  } catch (error) {
    console.error('Failed to parse Gemini response:', jsonText)
    throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
