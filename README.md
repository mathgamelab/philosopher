<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1mQO_RaJ1eCa4QjNZTVQbz9u-DWyPsim8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env` file:
   - 프로젝트 루트에 `.env` 파일을 생성하세요
   - 다음 내용을 추가하세요:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```
   - API 키는 [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급받을 수 있습니다

3. Run the app:
   ```bash
   npm run dev
   ```

## 보안 주의사항 (배포 시)

⚠️ **중요**: 현재 구조에서는 API 키가 클라이언트 번들에 포함되어 배포 시 노출될 수 있습니다.

### API 키 제한 설정 (권장)

배포 전에 Google Cloud Console에서 API 키에 제한을 설정하세요:

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 API 키 관리
2. **애플리케이션 제한사항** → **HTTP 리퍼러(웹사이트)** 선택
3. 배포할 도메인 추가:
   - `https://yourdomain.com/*`
   - `https://www.yourdomain.com/*`
4. **API 제한사항** → **키 제한** 선택
5. **Gemini API**만 허용하도록 설정

이렇게 하면 지정된 도메인에서만 API 키를 사용할 수 있어, 다른 사람이 키를 복사해도 사용할 수 없습니다.

### 더 안전한 방법 (선택사항)

완전한 보안을 위해서는 백엔드 서버를 구축하여 API 키를 서버에서만 관리하고, 클라이언트는 백엔드 API를 통해 요청하는 방식을 사용하세요.
