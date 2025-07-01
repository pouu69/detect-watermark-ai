#!/bin/bash

# 이 스크립트는 GitHub Actions에서 사용할 IAM 사용자를 생성하고 필요한 권한을 부여합니다.

# 기본 변수 설정
DEFAULT_PROJECT_NAME="gpt-watermark-detector"
DEFAULT_ENVIRONMENT="production"
DEFAULT_REGION="ap-northeast-2"
POLICY_FILE="github-actions-iam-policy.json"
TEMP_POLICY_FILE="github-actions-iam-policy-temp.json"

# 사용자 입력 받기
read -p "프로젝트 이름 (기본값: ${DEFAULT_PROJECT_NAME}): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-$DEFAULT_PROJECT_NAME}

read -p "환경 (기본값: ${DEFAULT_ENVIRONMENT}): " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-$DEFAULT_ENVIRONMENT}

read -p "AWS 리전 (기본값: ${DEFAULT_REGION}): " REGION
REGION=${REGION:-$DEFAULT_REGION}

# 변수 설정
USER_NAME="${PROJECT_NAME}-github-actions"
POLICY_NAME="${PROJECT_NAME}-github-actions-policy"

# 정책 파일 내용 확인
echo "정책 파일 '${POLICY_FILE}'의 내용을 확인합니다..."

# 정책 파일 내용 수정 (프로젝트 이름, 환경, 리전 변수 대체)
if [ -f "${POLICY_FILE}" ]; then
    echo "정책 파일을 수정합니다..."
    sed -e "s/gpt-watermark-detector/${PROJECT_NAME}/g" \
        -e "s/production/${ENVIRONMENT}/g" \
        -e "s/ap-northeast-2/${REGION}/g" \
        "${POLICY_FILE}" > "${TEMP_POLICY_FILE}"
    
    # 임시 파일을 원본 파일로 이동
    mv "${TEMP_POLICY_FILE}" "${POLICY_FILE}"
    echo "정책 파일이 수정되었습니다."
else
    echo "정책 파일 '${POLICY_FILE}'이 존재하지 않습니다."
    exit 1
fi

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}GitHub Actions용 IAM 사용자 생성을 시작합니다...${NC}"

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

# 정책 파일이 존재하는지 확인
if [ ! -f "${POLICY_FILE}" ]; then
    echo -e "${RED}정책 파일 '${POLICY_FILE}'이 존재하지 않습니다.${NC}"
    exit 1
fi

# IAM 사용자 생성
echo -e "${YELLOW}IAM 사용자 '${USER_NAME}'을 생성합니다...${NC}"
if aws iam get-user --user-name "${USER_NAME}" &>/dev/null; then
    echo -e "${GREEN}IAM 사용자 '${USER_NAME}'이 이미 존재합니다.${NC}"
else
    # 권한 경계 정책 생성
    BOUNDARY_POLICY_NAME="${PROJECT_NAME}-permission-boundary"
    BOUNDARY_POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='${BOUNDARY_POLICY_NAME}'].Arn" --output text)
    
    if [ -z "${BOUNDARY_POLICY_ARN}" ]; then
        echo -e "${YELLOW}권한 경계 정책을 생성합니다...${NC}"
        BOUNDARY_POLICY_ARN=$(aws iam create-policy \
            --policy-name "${BOUNDARY_POLICY_NAME}" \
            --policy-document '{
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": [
                            "s3:*",
                            "cloudfront:*",
                            "dynamodb:*",
                            "logs:*"
                        ],
                        "Resource": "*"
                    },
                    {
                        "Effect": "Deny",
                        "Action": [
                            "iam:*",
                            "organizations:*",
                            "account:*",
                            "ec2:*",
                            "rds:*"
                        ],
                        "Resource": "*"
                    }
                ]
            }' \
            --query "Policy.Arn" \
            --output text)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}권한 경계 정책이 생성되었습니다.${NC}"
        else
            echo -e "${RED}권한 경계 정책 생성에 실패했습니다.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}권한 경계 정책이 이미 존재합니다.${NC}"
    fi
    
    # IAM 사용자 생성 (권한 경계 적용)
    aws iam create-user \
        --user-name "${USER_NAME}" \
        --permissions-boundary "${BOUNDARY_POLICY_ARN}" \
        --tags Key=Project,Value="${PROJECT_NAME}" Key=Environment,Value="${ENVIRONMENT}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}IAM 사용자 '${USER_NAME}'이 생성되었습니다.${NC}"
    else
        echo -e "${RED}IAM 사용자 생성에 실패했습니다.${NC}"
        exit 1
    fi
fi

# IAM 정책 생성
echo -e "${YELLOW}IAM 정책 '${POLICY_NAME}'을 생성합니다...${NC}"
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='${POLICY_NAME}'].Arn" --output text)

if [ -n "${POLICY_ARN}" ]; then
    echo -e "${GREEN}IAM 정책 '${POLICY_NAME}'이 이미 존재합니다.${NC}"
    
    # 정책 업데이트
    echo -e "${YELLOW}IAM 정책을 업데이트합니다...${NC}"
    POLICY_VERSION=$(aws iam create-policy-version \
        --policy-arn "${POLICY_ARN}" \
        --policy-document file://"${POLICY_FILE}" \
        --set-as-default \
        --query "PolicyVersion.VersionId" \
        --output text)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}IAM 정책이 업데이트되었습니다. 버전: ${POLICY_VERSION}${NC}"
    else
        echo -e "${RED}IAM 정책 업데이트에 실패했습니다.${NC}"
        exit 1
    fi
else
    POLICY_ARN=$(aws iam create-policy \
        --policy-name "${POLICY_NAME}" \
        --policy-document file://"${POLICY_FILE}" \
        --query "Policy.Arn" \
        --output text)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}IAM 정책 '${POLICY_NAME}'이 생성되었습니다.${NC}"
    else
        echo -e "${RED}IAM 정책 생성에 실패했습니다.${NC}"
        exit 1
    fi
fi

# IAM 정책을 사용자에게 연결
echo -e "${YELLOW}IAM 정책을 사용자에게 연결합니다...${NC}"
aws iam attach-user-policy \
    --user-name "${USER_NAME}" \
    --policy-arn "${POLICY_ARN}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}IAM 정책이 사용자에게 연결되었습니다.${NC}"
else
    echo -e "${RED}IAM 정책 연결에 실패했습니다.${NC}"
    exit 1
fi

# 액세스 키 생성
echo -e "${YELLOW}액세스 키를 생성합니다...${NC}"
echo -e "${YELLOW}이미 액세스 키가 있는 경우, 기존 키를 삭제하고 새 키를 생성하시겠습니까? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # 기존 액세스 키 목록 조회
    ACCESS_KEYS=$(aws iam list-access-keys --user-name "${USER_NAME}" --query "AccessKeyMetadata[].AccessKeyId" --output text)
    
    # 기존 액세스 키 삭제
    for key in $ACCESS_KEYS; do
        echo -e "${YELLOW}액세스 키 '${key}'를 삭제합니다...${NC}"
        aws iam delete-access-key --user-name "${USER_NAME}" --access-key-id "${key}"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}액세스 키 '${key}'가 삭제되었습니다.${NC}"
        else
            echo -e "${RED}액세스 키 삭제에 실패했습니다.${NC}"
            exit 1
        fi
    done
    
    # 새 액세스 키 생성
    echo -e "${YELLOW}새 액세스 키를 생성합니다...${NC}"
    ACCESS_KEY=$(aws iam create-access-key --user-name "${USER_NAME}" --query "AccessKey.[AccessKeyId,SecretAccessKey]" --output text)
    
    if [ $? -eq 0 ]; then
        ACCESS_KEY_ID=$(echo "${ACCESS_KEY}" | awk '{print $1}')
        SECRET_ACCESS_KEY=$(echo "${ACCESS_KEY}" | awk '{print $2}')
        
        echo -e "${GREEN}새 액세스 키가 생성되었습니다.${NC}"
        echo -e "${YELLOW}다음 정보를 GitHub Secrets에 등록해주세요:${NC}"
        echo -e "${GREEN}AWS_ACCESS_KEY_ID: ${ACCESS_KEY_ID}${NC}"
        echo -e "${GREEN}AWS_SECRET_ACCESS_KEY: ${SECRET_ACCESS_KEY}${NC}"
        
        # 액세스 키 자동 교체 알림 설정
        EXPIRY_DATE=$(date -d "+90 days" +%Y-%m-%d)
        aws iam tag-user \
            --user-name "${USER_NAME}" \
            --tags Key=KeyRotation,Value="${EXPIRY_DATE}"
        
        echo -e "${YELLOW}액세스 키 만료일: ${EXPIRY_DATE} (90일 후)${NC}"
        echo -e "${YELLOW}이 날짜 이전에 액세스 키를 교체해주세요.${NC}"
    else
        echo -e "${RED}액세스 키 생성에 실패했습니다.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}액세스 키 생성을 건너뜁니다.${NC}"
fi

echo -e "${GREEN}GitHub Actions용 IAM 사용자 생성이 완료되었습니다.${NC}"
echo -e "${YELLOW}GitHub 저장소의 'Settings > Secrets and variables > Actions'에서 다음 시크릿을 등록해주세요:${NC}"
echo -e "${YELLOW}- AWS_ACCESS_KEY_ID${NC}"
echo -e "${YELLOW}- AWS_SECRET_ACCESS_KEY${NC}"

# 보안 권장 사항
echo -e "\n${YELLOW}보안 권장 사항:${NC}"
echo -e "1. ${GREEN}정기적인 액세스 키 교체:${NC} 90일마다 이 스크립트를 다시 실행하여 액세스 키를 교체하세요."
echo -e "2. ${GREEN}CloudTrail 로깅 활성화:${NC} AWS 콘솔에서 CloudTrail 서비스를 통해 API 호출 로깅을 활성화하세요."
echo -e "3. ${GREEN}MFA 활성화:${NC} AWS 계정의 루트 사용자 및 IAM 사용자에 MFA를 활성화하세요."
echo -e "4. ${GREEN}최소 권한 원칙:${NC} 필요한 권한만 부여되었는지 정기적으로 검토하세요."
echo -e "5. ${GREEN}미사용 자격 증명 제거:${NC} 사용하지 않는 액세스 키와 IAM 사용자를 정기적으로 제거하세요."

# 정책 파일 정리
echo -e "\n${YELLOW}정책 파일을 원래 상태로 복원합니다...${NC}"
git checkout -- "${POLICY_FILE}" 2>/dev/null || echo -e "${YELLOW}정책 파일 복원을 건너뜁니다.${NC}"
