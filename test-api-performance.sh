#!/bin/bash

echo "====================================="
echo "Testing /api/search/semantic (RAG)"
echo "====================================="

SEMANTIC_TOTAL=0

for i in {1..5}; do
  echo "Test $i/5..."
  START=$(date +%s%3N)

  curl -X POST "http://localhost:4000/api/search/semantic" \
    -H "Content-Type: application/json" \
    -d '{"query": "스테이크와 어울리는 레드 와인", "limit": 3}' \
    -o /dev/null -s -w ""

  END=$(date +%s%3N)
  DIFF=$((END - START))
  SECONDS=$(echo "scale=3; $DIFF / 1000" | bc)
  echo "  Response time: ${SECONDS}s"
  SEMANTIC_TOTAL=$((SEMANTIC_TOTAL + DIFF))
  sleep 1
done

SEMANTIC_AVG=$(echo "scale=3; $SEMANTIC_TOTAL / 5000" | bc)
echo ""
echo "Semantic API Average: ${SEMANTIC_AVG}s"
echo ""

echo "====================================="
echo "Testing /api/search/llm (Gemini)"
echo "====================================="

LLM_TOTAL=0

for i in {1..5}; do
  echo "Test $i/5..."
  START=$(date +%s%3N)

  curl -X POST "http://localhost:4000/api/search/llm" \
    -H "Content-Type: application/json" \
    -d '{"query": "스테이크와 어울리는 레드 와인", "limit": 3}' \
    -o /dev/null -s -w ""

  END=$(date +%s%3N)
  DIFF=$((END - START))
  SECONDS=$(echo "scale=3; $DIFF / 1000" | bc)
  echo "  Response time: ${SECONDS}s"
  LLM_TOTAL=$((LLM_TOTAL + DIFF))
  sleep 1
done

LLM_AVG=$(echo "scale=3; $LLM_TOTAL / 5000" | bc)
echo ""
echo "Gemini LLM API Average: ${LLM_AVG}s"
echo ""

echo "====================================="
echo "COMPARISON SUMMARY"
echo "====================================="
echo "Semantic (RAG):  ${SEMANTIC_AVG}s"
echo "Gemini (LLM):    ${LLM_AVG}s"

SPEEDUP=$(echo "scale=2; $LLM_AVG / $SEMANTIC_AVG" | bc)
echo "LLM is ${SPEEDUP}x slower than RAG"
echo "====================================="
