# 배포 가이드 🚀

이 프로젝트를 배포하는 가장 쉬운 방법들을 안내합니다.

## 방법 1: Vercel (가장 쉬움 ⭐ 추천)

Vercel은 GitHub과 연동하면 자동으로 배포해주는 가장 쉬운 방법입니다.

### 1단계: GitHub에 코드 업로드

1. GitHub에 새 저장소를 만드세요 (https://github.com/new)

2. **프로젝트 폴더에서 터미널 열기:**
   - Windows: 프로젝트 폴더에서 우클릭 → "터미널에서 열기" 또는 "PowerShell에서 열기"
   - 또는 VS Code에서 `Ctrl + `` (백틱) 키로 터미널 열기
   - 또는 명령 프롬프트/PowerShell을 열고 `cd "C:\Users\user\Desktop\철학자와-도란도란 (2)"` 실행

3. 다음 명령어를 **순서대로** 실행하세요:

```bash
# Git 저장소 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋 생성
git commit -m "Initial commit"

# 메인 브랜치 이름 설정
git branch -M main

# GitHub 저장소 연결 (사용자명과 저장소명을 실제 값으로 변경하세요!)
git remote add origin https://github.com/사용자명/저장소명.git

# GitHub에 업로드
git push -u origin main
```

**참고:** 
- Git이 설치되어 있어야 합니다. 없다면 [Git 다운로드](https://git-scm.com/download/win)
- `사용자명`과 `저장소명`을 실제 GitHub 사용자명과 저장소 이름으로 변경하세요

### 2단계: Vercel에 배포

1. [Vercel](https://vercel.com)에 가입하세요 (GitHub 계정으로 로그인 가능)
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 감지됨)
   - **Output Directory**: `dist` (자동 감지됨)
5. **Environment Variables** 섹션에서:
   - `GEMINI_API_KEY` 추가하고 API 키 값 입력
6. "Deploy" 클릭!

### 3단계: 완료!

배포가 완료되면 자동으로 URL이 생성됩니다 (예: `https://your-project.vercel.app`)

**장점:**
- ✅ 완전 무료
- ✅ GitHub에 푸시할 때마다 자동 배포
- ✅ HTTPS 자동 설정
- ✅ 전 세계 CDN
- ✅ 설정이 매우 간단

---

## 방법 2: GitHub Pages

GitHub Pages는 무료이지만 설정이 조금 더 필요합니다.

### 1단계: GitHub Actions 설정 파일 생성

프로젝트 루트에 `.github/workflows/deploy.yml` 파일을 생성하세요 (이미 생성되어 있을 수 있습니다).

### 2단계: GitHub에 업로드

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push
```

### 3단계: GitHub 저장소 설정

1. GitHub 저장소 → Settings → Pages
2. Source를 "GitHub Actions"로 선택
3. Actions 탭에서 워크플로우가 실행되는지 확인

### 4단계: 환경 변수 설정

GitHub 저장소 → Settings → Secrets and variables → Actions에서:
- `GEMINI_API_KEY` 추가

**주의:** GitHub Pages는 정적 사이트이므로, API 키가 클라이언트에 노출됩니다. 
반드시 Google Cloud Console에서 API 키 제한을 설정하세요!

---

## 방법 3: Netlify (Vercel과 유사)

1. [Netlify](https://www.netlify.com)에 가입
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 선택
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment variables에 `GEMINI_API_KEY` 추가
6. Deploy!

---

## ⚠️ 중요: API 키 보안 설정

배포 전에 **반드시** Google Cloud Console에서 API 키 제한을 설정하세요:

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. API 키 선택 → 편집
3. **애플리케이션 제한사항** → **HTTP 리퍼러(웹사이트)** 선택
4. 배포된 도메인 추가:
   - `https://your-domain.vercel.app/*`
   - `https://your-domain.netlify.app/*`
   - 등등
5. **API 제한사항** → **키 제한** → **Gemini API**만 선택
6. 저장

이렇게 하면 지정된 도메인에서만 API 키를 사용할 수 있습니다!

---

## 문제 해결

### 빌드 에러가 발생하면?

1. 로컬에서 `npm run build`가 성공하는지 확인
2. Vercel/Netlify의 빌드 로그 확인
3. 환경 변수가 제대로 설정되었는지 확인

### API 키가 작동하지 않으면?

1. 환경 변수 이름이 정확한지 확인 (`GEMINI_API_KEY`)
2. API 키 제한 설정이 올바른지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

---

## 추천 순서

1. **Vercel** (가장 쉬움) ⭐
2. Netlify (Vercel과 비슷)
3. GitHub Pages (무료이지만 설정이 더 필요)

