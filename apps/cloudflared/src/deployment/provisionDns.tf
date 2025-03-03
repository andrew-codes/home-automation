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
variable "subdomain" {
  type = string
  validation {
    condition     = length(var.subdomain) > 0
    error_message = "Cloudflare domain is required."
  }
}

variable "tunnelId" {
  type = string
  validation {
    condition     = length(var.tunnelId) > 0
    error_message = "Cloudflare tunnel ID is required."
  }
}

resource "cloudflare_record" "dns_record" {
  zone_id = var.zoneId
  name    = var.subdomain
  value   = var.tunnelId
  type    = "CNAME"
  proxied = true
  ttl     = 1
}
