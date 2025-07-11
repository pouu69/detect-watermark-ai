#!/bin/bash

# 이 스크립트는 Terraform 백엔드를 초기화하는 데 사용됩니다.
# Terraform 상태 파일을 저장할 S3 버킷과 상태 잠금을 위한 DynamoDB 테이블을 생성합니다.

# 변수 설정
PROJECT_NAME="gpt-watermark-detector"
REGION="ap-northeast-2"
BUCKET_NAME="${PROJECT_NAME}-terraform-state"
TABLE_NAME="${PROJECT_NAME}-terraform-locks"

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Terraform 백엔드 초기화를 시작합니다...${NC}"

# AWS CLI가 설치되어 있는지 확인
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI가 설치되어 있지 않습니다. 먼저 AWS CLI를 설치해주세요.${NC}"
    exit 1
fi

# AWS 자격 증명이 설정되어 있는지 확인
echo -e "${YELLOW}AWS 자격 증명을 확인합니다...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}AWS 자격 증명이 설정되어 있지 않습니다. 'aws configure' 명령을 실행하여 자격 증명을 설정해주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}AWS 자격 증명이 확인되었습니다.${NC}"

# S3 버킷 생성
echo -e "${YELLOW}S3 버킷 '${BUCKET_NAME}'을 생성합니다...${NC}"
if aws s3api head-bucket --bucket "${BUCKET_NAME}" 2>/dev/null; then
    echo -e "${GREEN}S3 버킷 '${BUCKET_NAME}'이 이미 존재합니다.${NC}"
else
    aws s3api create-bucket \
        --bucket "${BUCKET_NAME}" \
        --region "${REGION}" \
        --create-bucket-configuration LocationConstraint="${REGION}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}S3 버킷 '${BUCKET_NAME}'이 생성되었습니다.${NC}"
    else
        echo -e "${RED}S3 버킷 생성에 실패했습니다.${NC}"
        exit 1
    fi
fi

# S3 버킷 버전 관리 활성화
echo -e "${YELLOW}S3 버킷 버전 관리를 활성화합니다...${NC}"
aws s3api put-bucket-versioning \
    --bucket "${BUCKET_NAME}" \
    --versioning-configuration Status=Enabled

if [ $? -eq 0 ]; then
    echo -e "${GREEN}S3 버킷 버전 관리가 활성화되었습니다.${NC}"
else
    echo -e "${RED}S3 버킷 버전 관리 활성화에 실패했습니다.${NC}"
    exit 1
fi

# S3 버킷 서버 측 암호화 활성화
echo -e "${YELLOW}S3 버킷 서버 측 암호화를 활성화합니다...${NC}"
aws s3api put-bucket-encryption \
    --bucket "${BUCKET_NAME}" \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}S3 버킷 서버 측 암호화가 활성화되었습니다.${NC}"
else
    echo -e "${RED}S3 버킷 서버 측 암호화 활성화에 실패했습니다.${NC}"
    exit 1
fi

# S3 버킷 퍼블릭 액세스 차단 설정
echo -e "${YELLOW}S3 버킷 퍼블릭 액세스 차단을 설정합니다...${NC}"
aws s3api put-public-access-block \
    --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration '{
        "BlockPublicAcls": true,
        "IgnorePublicAcls": true,
        "BlockPublicPolicy": true,
        "RestrictPublicBuckets": true
    }'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}S3 버킷 퍼블릭 액세스 차단이 설정되었습니다.${NC}"
else
    echo -e "${RED}S3 버킷 퍼블릭 액세스 차단 설정에 실패했습니다.${NC}"
    exit 1
fi

# DynamoDB 테이블 생성
echo -e "${YELLOW}DynamoDB 테이블 '${TABLE_NAME}'을 생성합니다...${NC}"
if aws dynamodb describe-table --table-name "${TABLE_NAME}" &>/dev/null; then
    echo -e "${GREEN}DynamoDB 테이블 '${TABLE_NAME}'이 이미 존재합니다.${NC}"
else
    aws dynamodb create-table \
        --table-name "${TABLE_NAME}" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "${REGION}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}DynamoDB 테이블 '${TABLE_NAME}'이 생성되었습니다.${NC}"
    else
        echo -e "${RED}DynamoDB 테이블 생성에 실패했습니다.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Terraform 백엔드 초기화가 완료되었습니다.${NC}"
echo -e "${YELLOW}이제 'terraform init' 명령을 실행하여 Terraform을 초기화할 수 있습니다.${NC}"
