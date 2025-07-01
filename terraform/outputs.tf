output "website_bucket_name" {
  description = "S3 버킷 이름"
  value       = aws_s3_bucket.website.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront 배포 ID"
  value       = aws_cloudfront_distribution.website.id
}

output "website_url" {
  description = "웹사이트 URL (CloudFront 도메인)"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "custom_domain_url" {
  description = "사용자 지정 도메인 URL (도메인 설정 후 사용 가능)"
  value       = "도메인 설정 후 사용 가능: https://${var.domain_name}"
}

output "cloudfront_domain_name" {
  description = "CloudFront 도메인 이름"
  value       = aws_cloudfront_distribution.website.domain_name
}

# 도메인 설정 시 아래 주석을 해제하고 사용하세요
/*
output "name_servers" {
  description = "Route53 네임서버"
  value       = aws_route53_zone.primary.name_servers
}
*/
