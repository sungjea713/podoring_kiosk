# 🍷 Podoring Kiosk 개발 체크리스트

> **사용 방법**: 각 작업 완료 시 `[ ]`를 `[x]`로 변경하여 진행 상황을 추적하세요.

---

## Phase 1: 프로젝트 기반 구축 (1-2일)

### 1️⃣ 프로젝트 초기화
- [ ] 새 폴더 `podoring_kiosk` 생성
- [ ] `bun init -y` 실행
- [ ] Git 저장소 초기화 (`git init`)
- [ ] `.gitignore` 파일 생성

### 2️⃣ 필수 파일 생성
- [ ] `package.json` 작성
  - [ ] Bun 스크립트 설정 (`dev`, `start`)
  - [ ] 의존성 추가 (React, React Router, React Query, Zustand, Supabase, Lucide)
- [ ] `tsconfig.json` 작성 (TypeScript 설정)
- [ ] `bunfig.toml` 작성
- [ ] `.env.example` 작성 (환경 변수 템플릿)
- [ ] `.env.local` 작성 (실제 Supabase 연결 정보)
- [ ] `CLAUDE.md` 작성 (Bun 개발 가이드)

### 3️⃣ 의존성 설치
- [ ] `bun install` 실행
- [ ] 모든 패키지 정상 설치 확인

---

## Phase 2: 백엔드 구현 (2-3일)

### 4️⃣ TypeScript 타입 정의
- [ ] `src/types/index.ts` 생성
- [ ] `Wine` 인터페이스 작성 (WMS와 동일)
- [ ] `Inventory` 인터페이스 작성

### 5️⃣ Supabase 클라이언트 설정
- [ ] `src/db/supabase.ts` 생성 (서버용)
- [ ] 환경 변수에서 Supabase URL, ANON_KEY 가져오기
- [ ] 연결 테스트

### 6️⃣ API 구현 (읽기 전용)
- [ ] `src/api/wines.ts` 생성
  - [ ] `getWines()`: 와인 목록 조회 (필터링 지원)
  - [ ] `getWineById()`: 와인 상세 조회
- [ ] `src/api/inventory.ts` 생성
  - [ ] `getInventoryByWineId()`: 재고 위치 조회

### 7️⃣ Bun 서버 설정
- [ ] `src/index.ts` 생성
- [ ] `Bun.serve()` 설정 (Port 4000)
- [ ] API 라우팅 설정
  - [ ] `GET /api/health`: 헬스체크
  - [ ] `GET /api/wines`: 와인 목록
  - [ ] `GET /api/wines/:id`: 와인 상세
  - [ ] `GET /api/inventory/:wine_id`: 재고 위치
- [ ] 정적 파일 서빙 설정 (`/img/`)
- [ ] 서버 실행 테스트 (`bun run dev`)

### 8️⃣ API 테스트
- [ ] `curl http://localhost:4000/api/health` 테스트
- [ ] `curl http://localhost:4000/api/wines` 테스트
- [ ] `curl http://localhost:4000/api/wines/1` 테스트
- [ ] `curl http://localhost:4000/api/inventory/1` 테스트

---

## Phase 3: 프론트엔드 구현 (4-5일)

### 9️⃣ 프론트엔드 기본 구조
- [ ] `src/frontend/index.html` 생성 (PWA 메인 HTML)
- [ ] `src/frontend/manifest.json` 생성 (PWA 설정)
- [ ] `src/frontend/polyfill.js` 생성 (Supabase polyfill)
- [ ] `src/frontend/app.tsx` 생성 (React 루트)
- [ ] React Router 설정
- [ ] React Query 클라이언트 설정

### 🔟 React Hooks
- [ ] `src/frontend/hooks/useWines.ts` 작성
  - [ ] `useWines()`: 와인 목록 페칭
  - [ ] `useWine()`: 와인 상세 페칭
- [ ] `src/frontend/hooks/useInventory.ts` 작성
  - [ ] `useInventory()`: 재고 위치 페칭
- [ ] `src/frontend/hooks/useKioskState.ts` 작성 (Zustand)
  - [ ] 비활성 상태 관리
  - [ ] 필터 상태 관리

### 1️⃣1️⃣ Supabase 브라우저 클라이언트
- [ ] `src/frontend/lib/supabase.ts` 생성
- [ ] `window.__ENV__`로 환경 변수 접근 설정

### 1️⃣2️⃣ Figma 디자인 시스템 구현
- [ ] `src/frontend/styles/kiosk.css` 생성
- [ ] CSS 변수 설정 (색상, 간격, 폰트)
- [ ] 배경 그라데이션 스타일 (radial)
- [ ] 노이즈 오버레이 스타일
- [ ] 4열 그리드 레이아웃
- [ ] 반응형 스타일 (태블릿)

### 1️⃣3️⃣ 핵심 컴포넌트 구현

#### KioskLayout
- [ ] `src/frontend/components/KioskLayout.tsx` 생성
- [ ] 30초 비활성 타이머 구현
- [ ] 사용자 활동 감지 (터치, 마우스)
- [ ] 자동 홈 복귀 기능
- [ ] 배경 그라데이션 + 노이즈 오버레이

#### KioskHeader
- [ ] `src/frontend/components/KioskHeader.tsx` 생성
- [ ] 로고 섹션 (SVG)
- [ ] 타이틀: "FINE WINE SELECTION" (Playfair Display 폰트)
- [ ] 서브타이틀: "Our finest choice, Affordable"
- [ ] 필터 카드 가로 스크롤
- [ ] 골드 테두리 (활성 상태)

#### FilterCard
- [ ] `src/frontend/components/FilterCard.tsx` 생성
- [ ] 2:1 비율 (160px x 80px)
- [ ] 배경 이미지 + 어두운 오버레이
- [ ] 활성 상태 골드 링

#### KioskFooter
- [ ] `src/frontend/components/KioskFooter.tsx` 생성
- [ ] 검색 버튼 (다크 브라운)
- [ ] 장바구니 버튼 (와인 레드)
- [ ] 장바구니 개수 배지 (골드)
- [ ] 총 가격 표시

#### HomePage
- [ ] `src/frontend/components/HomePage.tsx` 생성
- [ ] 히어로 섹션
- [ ] 카테고리 버튼 (ALL, Red, White, Rosé, Sparkling)
- [ ] 검색 바

#### WineCatalog
- [ ] `src/frontend/components/WineCatalog.tsx` 생성
- [ ] 상단 필터 (타입, 국가, 검색)
- [ ] 4열 그리드 레이아웃
- [ ] 뒤로가기 버튼
- [ ] 로딩/빈 상태 처리

#### WineCard
- [ ] `src/frontend/components/WineCard.tsx` 생성
- [ ] **1:1 정사각형 이미지** (aspect-ratio: 1)
- [ ] 와인명 (2줄 말줄임)
- [ ] Vivino 평점 (골드 별)
- [ ] 국가명, 와이너리
- [ ] 타입 & 품종
- [ ] 가격
- [ ] **장바구니 추가 버튼** (하단, 와인 레드)

#### WineDetail
- [ ] `src/frontend/components/WineDetail.tsx` 생성
- [ ] 큰 와인 이미지
- [ ] 상세 정보 (빈티지, ABV, 국가, 지역 등)
- [ ] 재고 위치 표시
- [ ] 테이스팅 노트
- [ ] 설명
- [ ] 뒤로가기 버튼

#### InventoryLocation
- [ ] `src/frontend/components/InventoryLocation.tsx` 생성
- [ ] 재고 위치 배지 (A-3-2, A-5-1 형식)
- [ ] 골드 테두리 스타일

---

## Phase 4: PWA 및 터치 최적화 (1-2일)

### 1️⃣4️⃣ PWA 설정
- [ ] `manifest.json` 완성
  - [ ] 풀스크린 모드
  - [ ] 가로 방향 고정 (landscape)
  - [ ] 배경색, 테마 색상
- [ ] 아이콘 생성 및 추가
  - [ ] `icon-192.png`
  - [ ] `icon-512.png`
- [ ] `index.html`에 PWA 메타 태그 추가

### 1️⃣5️⃣ 터치 인터페이스 최적화
- [ ] `user-select: none` (텍스트 선택 방지)
- [ ] `-webkit-tap-highlight-color: transparent` (터치 하이라이트 제거)
- [ ] 큰 터치 영역 (최소 44x44px)
- [ ] `overscroll-behavior: none` (스크롤 바운스 방지)
- [ ] 터치 피드백 애니메이션

### 1️⃣6️⃣ 키오스크 모드 기능
- [ ] 비활성 타이머 테스트 (30초)
- [ ] 자동 홈 복귀 테스트
- [ ] 모든 페이지에서 작동 확인

---

## Phase 5: 테스트 및 배포 (1-2일)

### 1️⃣7️⃣ 로컬 테스트
- [ ] 서버 실행 (`bun run dev`)
- [ ] 홈 페이지 접속 (`http://localhost:4000`)
- [ ] 필터 카드 작동 확인
- [ ] 와인 목록 표시 확인
- [ ] 와인 카드 클릭 → 상세 페이지 확인
- [ ] 재고 위치 표시 확인
- [ ] 장바구니 버튼 작동 확인
- [ ] 검색 기능 테스트
- [ ] 필터링 기능 테스트 (타입, 국가)
- [ ] 비활성 타이머 테스트 (30초 대기)
- [ ] WMS 데이터 동기화 확인

### 1️⃣8️⃣ Railway 배포
- [ ] GitHub 저장소 생성
- [ ] 코드 커밋 및 푸시
  ```bash
  git add .
  git commit -m "Initial Podoring Kiosk"
  git remote add origin <repo-url>
  git push -u origin main
  ```
- [ ] Railway 프로젝트 생성
  - [ ] GitHub 저장소 연결
  - [ ] `railway.toml` 파일 확인
  - [ ] `nixpacks.toml` 파일 확인
- [ ] 환경 변수 설정 (Railway Dashboard)
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `NODE_ENV=production`
- [ ] 배포 확인
- [ ] 도메인 생성 (Generate Domain)
- [ ] 배포된 사이트 접속 테스트

### 1️⃣9️⃣ 태블릿 배포 (선택사항)
- [ ] Fully Kiosk Browser 설치
- [ ] 키오스크 모드 활성화
- [ ] 자동 시작 설정
- [ ] 화면 항상 켜짐
- [ ] 홈 버튼 비활성화
- [ ] 실제 사용 환경 테스트

---

## ✅ 최종 점검

### 기능 체크리스트
- [ ] 상단 고정 헤더 (로고 + 필터 카드)
- [ ] 필터 카드 가로 스크롤 작동
- [ ] 4열 그리드 와인 카드
- [ ] **1:1 정사각형 와인 이미지**
- [ ] 와인 정보 표시 (와인명, 국가, 와이너리, Vivino 평점, 가격)
- [ ] **장바구니 추가 버튼** (카드 하단)
- [ ] 하단 고정 푸터 (검색 + 장바구니 버튼)
- [ ] 와인 상세 페이지
- [ ] 재고 위치 표시 (A-3-2 형식)
- [ ] 검색 기능
- [ ] 필터링 기능 (타입, 국가)
- [ ] 30초 비활성 시 자동 홈 복귀
- [ ] WMS 데이터 실시간 동기화

### 디자인 체크리스트
- [ ] Figma 디자인 색상 일치
  - [ ] 배경 그라데이션 (#2F161A → #1C0E10)
  - [ ] 카드 베이지 (#f5f0e8)
  - [ ] 골드 강조 (#d4af37)
  - [ ] 와인 레드 버튼 (#6b2c2c)
- [ ] Playfair Display 폰트 (헤더)
- [ ] 노이즈 오버레이 효과
- [ ] 터치 최적화 (큰 버튼, 하이라이트 제거)
- [ ] 1080px 고정 너비
- [ ] 반응형 동작 (태블릿)

### 성능 체크리스트
- [ ] React Query 캐싱 (30초)
- [ ] 이미지 로딩 최적화
- [ ] API 응답 속도 확인
- [ ] 메모리 누수 없음
- [ ] 부드러운 스크롤
- [ ] 빠른 페이지 전환

---

## 📝 작업 완료 후

- [ ] README.md 작성 (프로젝트 설명, 설치 방법, 사용 방법)
- [ ] 스크린샷 추가 (GitHub README)
- [ ] 배포 URL 문서화
- [ ] WMS 팀과 공유

---

## 🐛 버그 및 이슈

작업 중 발견한 버그나 이슈를 아래에 기록하세요:

1.
2.
3.

---

© 2025 Podoring. All rights reserved.
