variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2" # 서울 리전
}

variable "domain_name" {
  description = "웹사이트 도메인 이름"
  type        = string
  default     = "gpt-watermark-detector.com"
}

variable "project_name" {
  description = "프로젝트 이름"
  type        = string
  default     = "gpt-watermark-detector"
}

variable "environment" {
  description = "배포 환경"
  type        = string
  default     = "production"
}
