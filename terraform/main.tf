# S3 버킷 설정
resource "aws_s3_bucket" "website" {
  bucket = "${var.project_name}-website-${var.environment}"

  tags = {
    Name        = "${var.project_name} 웹사이트"
    Environment = var.environment
  }
}

# S3 버킷 웹사이트 설정
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # SPA를 위한 설정
  }
}

# S3 버킷 퍼블릭 액세스 차단 설정
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 버킷 소유권 설정
resource "aws_s3_bucket_ownership_controls" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# CloudFront Origin Access Control 설정
resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${var.project_name}-oac-${var.environment}"
  description                       = "OAC for ${var.project_name} S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront 배포 설정
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # 북미, 유럽만 사용 (비용 최적화)

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.website.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "S3-${aws_s3_bucket.website.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # CachingOptimized 정책 사용
    cache_policy_id          = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" # CORS-S3Origin

    min_ttl                = 0
    default_ttl            = 86400    # 1일
    max_ttl                = 31536000 # 1년
  }
  
  # SPA를 위한 오류 페이지 설정
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }
  
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }
  
  # 도메인 설정 (사용자 지정 도메인 없이 CloudFront 기본 도메인 사용)
  # aliases = [var.domain_name, "www.${var.domain_name}"]
  
  # SSL 인증서 설정 (CloudFront 기본 인증서 사용)
  viewer_certificate {
    cloudfront_default_certificate = true
    # acm_certificate_arn      = aws_acm_certificate.website.arn
    # ssl_support_method       = "sni-only"
    # minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name        = "${var.project_name} CloudFront"
    Environment = var.environment
  }

  # 인증서 검증 의존성 제거 (CloudFront 기본 인증서 사용)
  # depends_on = [aws_acm_certificate_validation.website]
}

# 도메인 설정 시 아래 주석을 해제하고 사용하세요
/*
# ACM 인증서 설정
resource "aws_acm_certificate" "website" {
  provider = aws.us-east-1  # CloudFront는 us-east-1 리전의 인증서만 사용 가능
  
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name        = "${var.project_name} 인증서"
    Environment = var.environment
  }
}

# Route53 영역 설정
resource "aws_route53_zone" "primary" {
  name = var.domain_name
  
  tags = {
    Name        = "${var.project_name} 도메인"
    Environment = var.environment
  }
}

# ACM 인증서 검증을 위한 DNS 레코드 설정
resource "aws_route53_record" "website_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.primary.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

# ACM 인증서 검증 완료 확인
resource "aws_acm_certificate_validation" "website" {
  provider = aws.us-east-1
  
  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.website_validation : record.fqdn]
}

# Route53 A 레코드 설정 (apex 도메인)
resource "aws_route53_record" "website_a" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 A 레코드 설정 (www 서브도메인)
resource "aws_route53_record" "website_www" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
*/

# S3 버킷 정책 설정
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id
  policy = data.aws_iam_policy_document.s3_policy.json
}

# S3 버킷 정책 문서
data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.website.arn}/*"]
    
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.website.arn]
    }
  }
}

# Terraform 상태 파일을 저장할 S3 버킷 (초기 설정용)
resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.project_name}-terraform-state"

  tags = {
    Name        = "${var.project_name} Terraform 상태 버킷"
    Environment = var.environment
  }

  # 이미 생성된 경우 Terraform에서 관리하지 않음
  lifecycle {
    prevent_destroy = true
  }
}

# Terraform 상태 버킷 버전 관리 설정
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Terraform 상태 버킷 서버 측 암호화 설정
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Terraform 상태 잠금을 위한 DynamoDB 테이블
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "${var.project_name}-terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  
  attribute {
    name = "LockID"
    type = "S"
  }
  
  tags = {
    Name        = "${var.project_name} Terraform 잠금 테이블"
    Environment = var.environment
  }
}
