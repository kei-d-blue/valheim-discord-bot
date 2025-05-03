# Valheim Discord Bot

ValheimサーバーをDiscordから管理するためのボットです。AWS EC2インスタンスの起動/停止と状態確認ができます。

## 機能

- `/start` - インスタンスを起動
- `/stop` - インスタンスを停止
- `/status` - インスタンスの状態と稼働時間を表示

## セットアップ

### 必要な環境変数

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Discord Bot設定
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id

# AWS設定
AWS_REGION=your_aws_region
AWS_INSTANCE_ID=your_instance_id
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# ConoHa設定
CONOHA_TENANT_ID=your_tenant_id
CONOHA_API_USERNAME=your_api_username
CONOHA_API_PASSWORD=your_api_password
CONOHA_SERVER_ID=your_server_id

# 料金設定
HOURLY_RATE=10  # 1時間あたりの料金（円）
```

### 通常の実行方法

1. 必要なパッケージをインストール
```bash
npm install
```

2. ボットを起動
```bash
node bot.js
```

### Dockerでの実行方法

1. Dockerイメージのビルドと起動
```bash
docker compose up -d
```

2. ログの確認
```bash
docker compose logs -f
```

3. ボットの停止
```bash
docker compose down
```

## コマンドの説明

### `/start`
- EC2インスタンスを起動します
- すでに起動中の場合はその旨を表示します

### `/stop`
- EC2インスタンスを停止します
- 稼働時間と料金を表示します
- すでに停止中の場合はその旨を表示します

### `/status`
- EC2インスタンスの状態を表示します
- 稼働時間と料金を表示します
- IPアドレス情報も表示します

## 注意事項

- インスタンスの起動/停止には数分かかる場合があります
- 料金はAWSの料金体系に従って計算されます
- インスタンスの状態は定期的に更新されます

## 前提条件

- Node.js 18.x
- AWSアカウント
- Discord Application Public Key
- AWS EC2インスタンス（Valheimサーバー）

## アーキテクチャ

- Discord Bot
- AWS EC2インスタンス（Valheimサーバー）
- AWS SDK

## セキュリティ

- 環境変数による機密情報の管理
- Discordインタラクションの署名検証
- AWS認証情報の管理

## ライセンス

MIT 