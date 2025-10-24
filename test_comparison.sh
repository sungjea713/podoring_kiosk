#!/bin/bash

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test queries (숫자 조건 포함)
declare -a QUERIES=(
    "5만원 이하 레드 와인"
    "가장 비싼 와인 3개"
    "탄닌 낮은 레드 와인"
    "3만원에서 7만원 사이 프랑스 와인"
    "가장 저렴한 화이트 와인"
    "평점 높은 이탈리아 와인"
    "알코올 도수 높은 와인"
    "드라이한 화이트 와인 5만원 이하"
    "풀바디 레드 와인"
    "칠레 와인 평점 4점 이상"
)

echo "================================================"
echo "  API Performance & Accuracy Comparison"
echo "  Semantic vs Semantic-Hybrid"
echo "================================================"
echo ""

SEMANTIC_TOTAL=0
HYBRID_TOTAL=0

for i in "${!QUERIES[@]}"; do
    QUERY="${QUERIES[$i]}"
    NUM=$((i+1))

    echo "----------------------------------------"
    echo "Test #$NUM: \"$QUERY\""
    echo "----------------------------------------"

    # Test Semantic API
    echo -n "  [Semantic]      "
    START=$(perl -MTime::HiRes=time -e 'print time')
    RESULT_SEM=$(curl -X POST "http://localhost:4000/api/search/semantic" \
      -H "Content-Type: application/json" \
      -d "{\"query\": \"$QUERY\", \"limit\": 3}" \
      -s -w "\n%{time_total}")
    END=$(echo "$RESULT_SEM" | tail -1)
    WINES_SEM=$(echo "$RESULT_SEM" | head -n -1)

    echo "${END}s"
    SEMANTIC_TOTAL=$(echo "$SEMANTIC_TOTAL + $END" | bc)

    # Test Hybrid API
    echo -n "  [Hybrid]        "
    START=$(perl -MTime::HiRes=time -e 'print time')
    RESULT_HYB=$(curl -X POST "http://localhost:4000/api/search/semantic-hybrid" \
      -H "Content-Type: application/json" \
      -d "{\"query\": \"$QUERY\", \"limit\": 3}" \
      -s -w "\n%{time_total}")
    END=$(echo "$RESULT_HYB" | tail -1)
    WINES_HYB=$(echo "$RESULT_HYB" | head -n -1)

    echo "${END}s"
    HYBRID_TOTAL=$(echo "$HYBRID_TOTAL + $END" | bc)

    echo ""
    sleep 0.5
done

echo "================================================"
echo "  SUMMARY"
echo "================================================"

SEMANTIC_AVG=$(echo "scale=3; $SEMANTIC_TOTAL / ${#QUERIES[@]}" | bc)
HYBRID_AVG=$(echo "scale=3; $HYBRID_TOTAL / ${#QUERIES[@]}" | bc)

echo ""
echo "Average Response Times:"
echo "  Semantic API:       ${SEMANTIC_AVG}s"
echo "  Hybrid API:         ${HYBRID_AVG}s"
echo ""

if (( $(echo "$HYBRID_AVG < $SEMANTIC_AVG" | bc -l) )); then
    DIFF=$(echo "scale=2; (($SEMANTIC_AVG - $HYBRID_AVG) / $SEMANTIC_AVG) * 100" | bc)
    echo -e "${GREEN}✓ Hybrid is ${DIFF}% faster${NC}"
elif (( $(echo "$HYBRID_AVG > $SEMANTIC_AVG" | bc -l) )); then
    DIFF=$(echo "scale=2; (($HYBRID_AVG - $SEMANTIC_AVG) / $SEMANTIC_AVG) * 100" | bc)
    echo -e "${YELLOW}⚠ Hybrid is ${DIFF}% slower${NC}"
else
    echo "Same speed"
fi

echo ""
echo "================================================"
