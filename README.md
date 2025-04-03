# Valheim Discord Bot

ValheimサーバーをDiscordから制御するためのボットです。

## セットアップ

1. 必要なパッケージをインストール:
```bash
npm install
```

2. `.env`ファイルを編集し、以下の情報を設定:
- `DISCORD_TOKEN`: Discordボットのトークン
- `CLIENT_ID`: DiscordアプリケーションのクライアントID
- `GUILD_ID`: 使用するDiscordサーバーのID

3. ボットを起動:
```bash
npm start
```

## 利用可能なコマンド

- `/start` - Valheimサーバーを起動します
- `/stop` - Valheimサーバーを停止します
- `/status` - Valheimサーバーの現在の状態を確認します

## 注意事項

- このボットを使用するには、Discordサーバーに管理者権限が必要です
- AWS EC2の認証情報が正しく設定されていることを確認してください

## 機能

- DiscordからValheimサーバー（EC2インスタンス）の起動/停止
- サーバーの状態確認

## 前提条件

- Node.js 18.x
- AWSアカウント
- Discord Application Public Key
- EC2インスタンス（Valheimサーバー）

## アーキテクチャ

- AWS Lambda + API Gateway
- Discord Webhook
- EC2インスタンス（Valheimサーバー）

## セキュリティ

- IAMロールによる最小権限の原則
- 環境変数による機密情報の管理
- CORSの設定
- Discordインタラクションの署名検証

## ライセンス

MIT 