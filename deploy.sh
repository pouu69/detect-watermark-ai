#!/bin/bash

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 함수 정의: 오류 처리
handle_error() {
  echo -e "${RED}오류가 발생했습니다: $1${NC}"
  exit 1
}

# 함수 정의: 진행 상황 표시
show_progress() {
  echo -e "${YELLOW}$1${NC}"
}

# 함수 정의: 성공 메시지 표시
show_success() {
  echo -e "${GREEN}$1${NC}"
}

# 작업 디렉토리 확인
if [ ! -d "terraform" ]; then
  handle_error "terraform 디렉토리를 찾을 수 없습니다. 프로젝트 루트 디렉토리에서 스크립트를 실행해주세요."
fi

# 1. Terraform 초기화
show_progress "1. Terraform 초기화 중..."
cd terraform && terraform init || handle_error "Terraform 초기화 실패"
show_success "Terraform 초기화 완료"

# 2. Terraform 적용
show_progress "2. AWS 인프라 배포 중..."
terraform apply -auto-approve || handle_error "Terraform 적용 실패"
show_success "AWS 인프라 배포 완료"

# 3. 웹사이트 빌드
show_progress "3. React 애플리케이션 빌드 중..."
cd .. && npm run build || handle_error "애플리케이션 빌드 실패"
show_success "React 애플리케이션 빌드 완료"

# 4. S3 버킷 이름 가져오기
show_progress "4. S3 버킷 정보 가져오는 중..."
BUCKET_NAME=$(cd terraform && terraform output -raw website_bucket_name)
if [ -z "$BUCKET_NAME" ]; then
  handle_error "S3 버킷 이름을 가져올 수 없습니다."
fi
show_success "S3 버킷 이름: $BUCKET_NAME"

# 5. S3에 파일 업로드
show_progress "5. 빌드된 파일을 S3에 업로드 중..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete || handle_error "S3 업로드 실패"
show_success "S3 업로드 완료"

# 6. CloudFront 배포 ID 가져오기
show_progress "6. CloudFront 배포 정보 가져오는 중..."
DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
if [ -z "$DISTRIBUTION_ID" ]; then
  handle_error "CloudFront 배포 ID를 가져올 수 없습니다."
fi
show_success "CloudFront 배포 ID: $DISTRIBUTION_ID"

# 7. CloudFront 캐시 무효화
show_progress "7. CloudFront 캐시 무효화 중..."
INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --query 'Invalidation.Id' --output text)
if [ -z "$INVALIDATION_ID" ]; then
  handle_error "CloudFront 캐시 무효화 실패"
fi
show_success "CloudFront 캐시 무효화 요청 완료 (ID: $INVALIDATION_ID)"

# 8. 무효화 상태 확인
show_progress "8. 캐시 무효화 상태 확인 중..."
aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID
show_success "CloudFront 캐시 무효화 완료"

# 9. 배포 URL 가져오기
CLOUDFRONT_URL=$(cd terraform && terraform output -raw website_url)
CUSTOM_DOMAIN=$(cd terraform && terraform output -raw domain_name 2>/dev/null || echo "gpt-scan.org")

# 10. 배포 완료 메시지
echo -e "\n${GREEN}========== 배포 완료 ==========${NC}"
echo -e "${GREEN}CloudFront URL: ${CLOUDFRONT_URL}${NC}"
echo -e "${GREEN}사용자 지정 도메인: https://${CUSTOM_DOMAIN}${NC}"
