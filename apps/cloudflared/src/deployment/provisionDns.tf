terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.1.0"
    }
  }
}
provider "cloudflare" {
  email     = var.cloudflareEmail
  api_token = var.cloudflareApiToken
}

variable "cloudflareEmail" {
  type = string
  validation {
    condition     = length(var.cloudflareEmail) > 0
    error_message = "Cloudflare email is required."
  }
}

variable "cloudflareApiToken" {
  type = string
  validation {
    condition     = length(var.cloudflareApiToken) > 0
    error_message = "Cloudflare API token is required."
  }
}

variable "zoneId" {
  type = string
  validation {
    condition     = length(var.zoneId) > 0
    error_message = "Cloudflare zone ID is required."
  }
}

variable "tunnelId" {
  type = string
  validation {
    condition     = length(var.tunnelId) > 0
    error_message = "Cloudflare tunnel ID is required."
  }
}

resource "cloudflare_dns_record" "pihole1" {
  zone_id = var.zoneId
  name    = "pihole1"
  content = var.tunnelId
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "pihole2" {
  zone_id = var.zoneId
  name    = "pihole2"
  content = var.tunnelId
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "nas" {
  zone_id = var.zoneId
  name    = "nas"
  content = var.tunnelId
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "games" {
  zone_id = var.zoneId
  name    = "games"
  content = var.tunnelId
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "games-staging" {
  zone_id = var.zoneId
  name    = "games-staging"
  content = var.tunnelId
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "grafana" {
  zone_id = var.zoneId
  name    = "grafana"
  content = var.tunnelId
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "ps" {
  zone_id = var.zoneId
  name    = "ps"
  content = var.tunnelId
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "zwave" {
  zone_id = var.zoneId
  name    = "zwave"
  content = var.tunnelId
  type    = "CNAME"
  proxied = true
  ttl     = 1
}
