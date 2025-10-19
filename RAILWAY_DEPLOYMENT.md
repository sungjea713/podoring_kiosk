# Railway 배포 가이드

## 사전 준비사항

1. **Railway 계정 생성**
   - https://railway.app 접속
   - GitHub 계정으로 로그인

2. **Supabase 프로젝트 확인**
   - Supabase URL과 Anon Key 준비
   - 데이터베이스가 정상적으로 설정되어 있는지 확인

## Railway 프로젝트 생성

### 1. 새 프로젝트 생성

```bash
# Railway CLI 설치 (선택사항)
npm install -g @railway/cli

# 로그인
railway login
```

### 2. GitHub 연동 배포 (권장)

1. Railway 대시보드에서 "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. `podoring_kiosk` 저장소 선택
4. Railway가 자동으로 감지합니다

### 3. 환경 변수 설정

Railway 대시보드에서 다음 환경 변수를 설정하세요:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

**설정 방법:**
1. Railway 프로젝트 선택
2. "Variables" 탭 클릭
3. 위의 환경 변수 추가

## 배포 설정

### nixpacks.toml 생성

프로젝트 루트에 `nixpacks.toml` 파일이 생성되어 있어야 합니다:

```toml
[phases.setup]
nixPkgs = ["bun"]

[phases.install]
cmds = ["bun install"]

[phases.build]
cmds = []

[start]
cmd = "bun run start"
```

### .gitignore 확인

다음 항목들이 포함되어 있는지 확인:

```
node_modules/
.env
.env.local
dist/
*.log
.DS_Store
```

## 배포 프로세스

### 자동 배포 (GitHub 연동 시)

1. 코드를 GitHub에 푸시
   ```bash
   git add .
   git commit -m "Deploy to Railway"
   git push origin main
   ```

2. Railway가 자동으로 배포를 시작합니다
3. 배포 로그를 실시간으로 확인할 수 있습니다

### CLI를 통한 수동 배포

```bash
# 프로젝트 초기화
railway init

# 환경 변수 설정
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_ANON_KEY=your_key

# 배포
railway up
```

## 배포 후 확인사항

### 1. 서비스 상태 확인

- Railway 대시보드에서 "Deployments" 탭 확인
- 빌드 로그에서 에러 확인
- 서비스가 "Active" 상태인지 확인

### 2. 도메인 설정

1. "Settings" 탭으로 이동
2. "Domains" 섹션에서 생성된 URL 확인
3. 커스텀 도메인 설정 (선택사항)

### 3. 앱 테스트

- 생성된 URL로 접속
- 와인 목록이 정상적으로 로드되는지 확인
- 필터링, 상세보기, 장바구니 기능 테스트
- Voice Assistant 모달 테스트

## 트러블슈팅

### 빌드 실패

**문제:** Bun을 찾을 수 없다는 에러
```bash
Solution: nixpacks.toml 파일이 제대로 설정되어 있는지 확인
```

**문제:** 의존성 설치 실패
```bash
Solution: package.json 확인 및 bun install 로컬 테스트
```

### 런타임 에러

**문제:** Supabase 연결 실패
```bash
Solution:
1. 환경 변수가 올바르게 설정되어 있는지 확인
2. Supabase URL과 Key가 유효한지 확인
3. Railway 로그에서 자세한 에러 메시지 확인
```

**문제:** 정적 파일 로드 실패
```bash
Solution:
1. public/img 폴더의 이미지 파일들이 저장소에 포함되어 있는지 확인
2. .gitignore에서 public 폴더가 제외되지 않았는지 확인
```

### 포트 에러

**문제:** PORT 환경 변수 관련 에러
```bash
Solution:
Railway에서 PORT 환경 변수 설정 (기본값: 3000)
```

## 로그 확인

### Railway 대시보드에서:
1. 프로젝트 선택
2. "Deployments" 탭
3. 최근 배포 클릭
4. "View Logs" 클릭

### CLI에서:
```bash
railway logs
```

## 재배포

### 코드 변경 후:
```bash
git add .
git commit -m "Update: description"
git push origin main
```
자동으로 재배포됩니다.

### 강제 재배포:
Railway 대시보드에서 "Deploy" 버튼 클릭

## 스케일링

### 수직 스케일링 (성능 향상):
1. "Settings" 탭
2. "Resources" 섹션
3. CPU/메모리 조정

### 수평 스케일링 (복제):
Railway Pro 플랜에서 지원

## 모니터링

### 메트릭 확인:
1. "Metrics" 탭
2. CPU, 메모리, 네트워크 사용량 확인
3. 응답 시간 모니터링

### 알림 설정:
1. "Settings" 탭
2. "Notifications" 섹션
3. 이메일/Slack 알림 설정

## 비용 관리

- **Hobby Plan (무료)**: $5 크레딧/월, 개발/테스트용
- **Pro Plan**: 사용량 기반 과금, 프로덕션용

## 보안

1. **환경 변수**: 민감한 정보는 반드시 환경 변수로 설정
2. **HTTPS**: Railway가 자동으로 제공
3. **도메인**: 커스텀 도메인 사용 권장

## 백업

1. Supabase 데이터베이스는 별도로 백업
2. 코드는 GitHub에 버전 관리
3. Railway는 배포 히스토리 유지

## 참고 링크

- Railway 문서: https://docs.railway.app
- Bun 문서: https://bun.sh/docs
- Supabase 문서: https://supabase.com/docs
