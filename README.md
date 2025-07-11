# GPT 워터마크 탐지기

텍스트에 숨겨진 워터마크를 감지하여 AI 생성 콘텐츠를 정확하게 식별하는 고급 분석 도구입니다.

![GPT 워터마크 탐지기 스크린샷](https://via.placeholder.com/800x400?text=GPT+워터마크+탐지기)

## 📋 목차

- [소개](#소개)
- [주요 기능](#주요-기능)
- [설치 방법](#설치-방법)
- [사용 방법](#사용-방법)
- [AWS 배포 가이드](#aws-배포-가이드)
- [기술 스택](#기술-스택)
- [라이선스](#라이선스)
- [연락처](#연락처)

## 🔍 소개

GPT 워터마크 탐지기는 ChatGPT와 같은 AI 모델이 생성한 텍스트에 숨겨진 워터마크를 감지하고 제거하는 웹 기반 도구입니다. 최근 GPT-o3와 GPT-o4 mini 같은 최신 모델에서 발견되는 보이지 않는 워터마크를 효과적으로 식별하여 AI 생성 콘텐츠를 구분할 수 있습니다.

### 워터마크란?

AI 텍스트 워터마크는 육안으로는 보이지 않지만, 텍스트에 숨겨진 특수 유니코드 문자들입니다. 주로 다음과 같은 종류가 있습니다:

- **제로 너비 문자**: 화면에 표시되지 않는 공백이나 제어 문자
- **특수 공백**: 일반 공백처럼 보이지만 다른 코드를 가진 특수 유니코드 문자
- **이모지 변형 선택자**: 이모지 뒤에 붙어 변형을 주는 특수 문자

## ✨ 주요 기능

### 워터마크 감지 기능
- 다양한 유형의 워터마크 감지 (제로 너비 문자, 특수 공백, 이모지 변형 선택자 등)
- 워터마크 위치 시각적 강조 표시
- GPT 작성 확률 계산 및 표시

### 워터마크 제거 기능
- 감지된 워터마크 제거
- 원본과 정리된 텍스트 비교 제공
- 정리된 텍스트 복사 기능

### 상세 분석 기능
- 통계 정보: 총 문자 수, 워터마크 수, 이모지 수, GPT 점수(%)
- 워터마크 유형 분석: 유니코드 워터마크, HTML 엔티티, 특수 패턴
- 단어 빈도 분석: 상위 10개 단어 빈도 및 비율 (차트 및 표 형태로 표시)
- 문장 시작 패턴 분석: 상위 5개 패턴 및 빈도

## 🚀 설치 방법

### 요구 사항
- Node.js 16.0.0 이상
- npm 또는 yarn

### 파비콘 및 OG 이미지 관리

프로젝트는 다양한 기기와 브라우저에 최적화된 파비콘 세트를 포함하고 있습니다:

- SVG 파비콘 (`public/favicon.svg`)
- ICO 파비콘 (`public/favicon.ico`)
- 다양한 크기의 PNG 파비콘 (`public/favicon/favicon-*.png`)
- Apple Touch Icon (`public/favicon/apple-touch-icon.png`)
- 웹 앱 매니페스트 (`public/site.webmanifest`)

파비콘을 업데이트하려면:

1. `public/favicon.svg` 파일을 새 디자인으로 교체합니다.
2. 다음 명령을 실행하여 모든 파비콘 파일을 재생성합니다:
   ```bash
   node scripts/generate-favicons.js
   ```

이 스크립트는 SVG 파일을 기반으로 다양한 크기와 형식의 파비콘을 자동으로 생성합니다.

#### OG 이미지 (소셜 미디어 썸네일)

프로젝트는 소셜 미디어에 공유될 때 표시되는 OG 이미지를 포함하고 있습니다:

- PNG OG 이미지 (`public/og-image.png`) - 1200x630 픽셀 크기

OG 이미지를 업데이트하려면:

1. 기존 파비콘 디자인을 기반으로 새 OG 이미지를 생성하려면 다음 명령을 실행합니다:
   ```bash
   node scripts/generate-og-image.js
   ```

2. 또는 직접 디자인한 이미지를 `public/og-image.png`로 저장합니다. 이미지는 1200x630 픽셀 크기를 권장합니다.

OG 이미지는 Facebook, Twitter, KakaoTalk 등의 소셜 미디어에서 링크를 공유할 때 표시되는 썸네일 이미지입니다.

### 설치 단계

1. 저장소 클론
   ```bash
   git clone https://github.com/pouu69/detect-watermark-ai.git
   cd detect-watermark-ai
   ```

2. 의존성 설치
   ```bash
   npm install
   # 또는
   yarn install
   ```

3. 개발 서버 실행
   ```bash
   npm run dev
   # 또는
   yarn dev
   ```

4. 브라우저에서 `http://localhost:5173` 접속

## 📝 사용 방법

### 워터마크 감지하기

1. 메인 페이지의 텍스트 입력 영역에 분석할 텍스트를 붙여넣습니다.
2. "텍스트 분석하기" 버튼을 클릭합니다.
3. 분석 결과 탭에서 워터마크 감지 결과와 통계 정보를 확인합니다.
4. 유형 분석 탭에서 워터마크 유형, 단어 빈도, 문장 패턴 등 상세 분석 결과를 확인합니다.

### 워터마크 제거하기

1. 메인 페이지의 텍스트 입력 영역에 정리할 텍스트를 붙여넣습니다.
2. "워터마크 제거" 탭을 선택합니다.
3. "워터마크 제거하기" 버튼을 클릭합니다.
4. 원본 텍스트와 정리된 텍스트를 비교하고, 필요한 경우 "정리된 텍스트 복사" 버튼을 클릭하여 클립보드에 복사합니다.

### 테스트 기능

개발 및 테스트 목적으로 "테스트용 워터마크 추가" 버튼을 사용하여 입력된 텍스트에 인위적으로 워터마크를 추가할 수 있습니다.

## 🛠️ 기술 스택

- **프론트엔드**: React, TypeScript, Vite
- **스타일링**: SCSS
- **차트 라이브러리**: Chart.js, React-Chartjs-2
- **상태 관리**: React Hooks
- **빌드 도구**: Vite
- **인프라**: AWS (S3, CloudFront, Route53, ACM)
- **CI/CD**: GitHub Actions
- **IaC**: Terraform

## 🚀 AWS 배포 가이드

이 프로젝트는 AWS S3, CloudFront를 사용하여 정적 웹 호스팅을 구성하고, GitHub Actions를 통해 CI/CD 파이프라인을 구축합니다. 사용자 지정 도메인 없이도 CloudFront의 기본 도메인을 사용하여 배포할 수 있습니다.

### 사전 요구사항

- AWS 계정
- AWS CLI 설치 및 구성
- Terraform 설치 (v1.0.0 이상)
- GitHub 계정

### 배포 단계

#### 1. Terraform 백엔드 초기화

Terraform 상태 파일을 저장할 S3 버킷과 DynamoDB 테이블을 생성합니다:

```bash
cd terraform
./init-terraform-backend.sh
```

#### 2. GitHub Actions용 IAM 사용자 생성

GitHub Actions에서 AWS 리소스에 접근하기 위한 IAM 사용자를 생성합니다:

```bash
cd terraform
./create-github-actions-user.sh
```

스크립트 실행 후 출력되는 액세스 키 ID와 시크릿 액세스 키를 GitHub 저장소의 시크릿으로 등록합니다:

1. GitHub 저장소에서 `Settings > Secrets and variables > Actions` 메뉴로 이동
2. `New repository secret` 버튼 클릭
3. 다음 시크릿 추가:
   - `AWS_ACCESS_KEY_ID`: 액세스 키 ID
   - `AWS_SECRET_ACCESS_KEY`: 시크릿 액세스 키

#### 3. GitHub Actions 워크플로우 활성화

GitHub 저장소에 코드를 푸시하면 자동으로 배포 워크플로우가 실행됩니다:

```bash
git add .
git commit -m "Initial AWS deployment setup"
git push origin main
```

#### 4. 배포 확인

배포가 완료되면 다음 URL에서 웹사이트에 접속할 수 있습니다:

- 서비스 주소: `http://gpt-scan.org`
- CloudFront 도메인: `https://d39svrmmc9o0pz.cloudfront.net`

이 URL은 이미 배포가 완료되어 사용 가능합니다. 직접 접속하여 GPT 워터마크 탐지기를 사용해보세요!

Terraform 출력에서 `website_url` 값을 확인하여 정확한 URL을 얻을 수 있습니다:

```bash
cd terraform
terraform output website_url
```

### 수동 배포 (선택 사항)

GitHub Actions 없이 수동으로 배포하려면 다음 명령을 실행합니다:

```bash
# Terraform 초기화 및 적용
cd terraform
terraform init
terraform apply

# 웹사이트 빌드 및 배포
cd ..
npm run build
aws s3 sync dist/ s3://$(terraform -chdir=terraform output -raw website_bucket_name) --delete
aws cloudfront create-invalidation --distribution-id $(terraform -chdir=terraform output -raw cloudfront_distribution_id) --paths "/*"
```

### 인프라 삭제

더 이상 필요하지 않은 경우 다음 명령으로 모든 AWS 리소스를 삭제할 수 있습니다:

```bash
cd terraform
terraform destroy
```

> **주의**: 이 명령은 모든 AWS 리소스를 삭제합니다. 실행 전에 신중하게 검토하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- 개발자: pouu69@gmail.com
- 프로젝트 저장소: [GitHub](https://github.com/pouu69/detect-watermark-ai)
- 이슈 보고: [GitHub Issues](https://github.com/pouu69/detect-watermark-ai/issues)
