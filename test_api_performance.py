#!/usr/bin/env python3
import requests
import time
import json

def test_api(url, payload, num_tests=5):
    """Test API and return list of response times"""
    times = []

    for i in range(num_tests):
        print(f"  Test {i+1}/{num_tests}...", end=" ")

        start = time.time()
        try:
            response = requests.post(url, json=payload, timeout=60)
            end = time.time()

            elapsed = end - start
            times.append(elapsed)
            print(f"{elapsed:.3f}s")

            time.sleep(1)  # 1초 대기
        except Exception as e:
            print(f"ERROR: {e}")
            times.append(None)

    return times

def main():
    base_url = "http://localhost:4000"
    payload = {
        "query": "스테이크와 어울리는 레드 와인",
        "limit": 3
    }

    print("=" * 60)
    print("API Performance Comparison Test")
    print("=" * 60)
    print()

    # Test Semantic API (RAG)
    print("Testing /api/search/semantic (RAG)")
    print("-" * 60)
    semantic_times = test_api(f"{base_url}/api/search/semantic", payload)
    print()

    # Test LLM API (Gemini)
    print("Testing /api/search/llm (Gemini)")
    print("-" * 60)
    llm_times = test_api(f"{base_url}/api/search/llm", payload)
    print()

    # Calculate averages
    semantic_avg = sum(t for t in semantic_times if t is not None) / len([t for t in semantic_times if t is not None])
    llm_avg = sum(t for t in llm_times if t is not None) / len([t for t in llm_times if t is not None])

    # Print summary
    print("=" * 60)
    print("COMPARISON SUMMARY")
    print("=" * 60)
    print(f"Semantic (RAG) Average:  {semantic_avg:.3f}s")
    print(f"  Min: {min(t for t in semantic_times if t is not None):.3f}s")
    print(f"  Max: {max(t for t in semantic_times if t is not None):.3f}s")
    print()
    print(f"Gemini (LLM) Average:    {llm_avg:.3f}s")
    print(f"  Min: {min(t for t in llm_times if t is not None):.3f}s")
    print(f"  Max: {max(t for t in llm_times if t is not None):.3f}s")
    print()
    print(f"Speed Difference: LLM is {llm_avg / semantic_avg:.1f}x slower than RAG")
    print("=" * 60)

if __name__ == "__main__":
    main()
