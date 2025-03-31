variable "project_name" {
  description = "プロジェクト名"
  type        = string
  default     = "valheim"
}

variable "environment" {
  description = "環境名（dev, stg, prod）"
  type        = string
  default     = "dev"
}

variable "discord_bot_token" {
  description = "Discordボットトークン"
  type        = string
  sensitive   = true
} 