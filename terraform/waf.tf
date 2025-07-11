# AWS WAF 웹 ACL 설정
resource "aws_wafv2_web_acl" "main" {
  provider    = aws.us-east-1  # CloudFront WAF는 us-east-1에 생성해야 함
  name        = "${var.project_name}-web-acl-${var.environment}"
  description = "WAF Web ACL for ${var.project_name}"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # AWS 관리형 규칙: 핵심 규칙 세트 (CRS)
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 0

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # AWS 관리형 규칙: 알려진 잘못된 입력 방지
  rule {
    name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # AWS 관리형 규칙: SQL 인젝션 방지
  rule {
    name     = "AWS-AWSManagedRulesSQLiRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesSQLiRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # AWS 관리형 규칙: Linux 운영 체제 방지
  rule {
    name     = "AWS-AWSManagedRulesLinuxRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesLinuxRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesLinuxRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # 속도 기반 규칙 (DDoS 및 무차별 대입 공격 방지)
  rule {
    name     = "RateBasedRule"
    priority = 4

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 1000 # 5분당 IP당 최대 요청 수
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateBasedRule"
      sampled_requests_enabled   = true
    }
  }

  # 지역 차단 규칙 (선택적으로 특정 국가 차단)
  rule {
    name     = "GeoBlockRule"
    priority = 5

    action {
      block {}
    }

    statement {
      geo_match_statement {
        country_codes = ["RU", "CN", "IR", "KP"] # 차단할 국가 코드
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "GeoBlockRule"
      sampled_requests_enabled   = true
    }
  }

  # 사용자 지정 규칙: 악성 봇 차단
  rule {
    name     = "BadBotRule"
    priority = 6

    action {
      block {}
    }

    statement {
      byte_match_statement {
        field_to_match {
          single_header {
            name = "user-agent"
          }
        }
        positional_constraint = "CONTAINS"
        search_string         = "bad-bot"
        text_transformation {
          priority = 0
          type     = "LOWERCASE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "BadBotRule"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-web-acl-metric"
    sampled_requests_enabled   = true
  }

  tags = {
    Name        = "${var.project_name} WAF Web ACL"
    Environment = var.environment
  }
}

# CloudFront 배포와 WAF 연결 (비활성화)
/*
resource "aws_wafv2_web_acl_association" "main" {
  provider     = aws.us-east-1
  resource_arn = aws_cloudfront_distribution.website.arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
*/

# WAF 로깅 설정 (선택 사항)
resource "aws_s3_bucket" "waf_logs" {
  provider = aws.us-east-1
  bucket   = "${var.project_name}-waf-logs-${var.environment}"

  tags = {
    Name        = "${var.project_name} WAF 로그"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_ownership_controls" "waf_logs" {
  provider = aws.us-east-1
  bucket   = aws_s3_bucket.waf_logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "waf_logs" {
  provider = aws.us-east-1
  bucket   = aws_s3_bucket.waf_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# WAF 로깅 설정 (비활성화)
/*
resource "aws_wafv2_web_acl_logging_configuration" "main" {
  provider               = aws.us-east-1
  log_destination_configs = ["${aws_s3_bucket.waf_logs.arn}/"]
  resource_arn            = aws_wafv2_web_acl.main.arn
}
*/
