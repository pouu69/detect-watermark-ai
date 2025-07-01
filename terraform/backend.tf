terraform {
  backend "s3" {
    bucket         = "gpt-watermark-detector-terraform-state"
    key            = "terraform.tfstate"
    region         = "ap-northeast-2"  # 서울 리전
    encrypt        = true
    dynamodb_table = "gpt-watermark-detector-terraform-locks"
  }
}
