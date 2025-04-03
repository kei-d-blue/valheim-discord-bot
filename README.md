# Valheim Discord Bot

DiscordからValheimサーバーを管理するためのボットです。ConoHa APIを使用してサーバーの起動、停止、状態確認、詳細情報の表示ができます。

## 機能

- `/start` - Valheimサーバーを起動します
- `/stop` - Valheimサーバーを停止します
- `/status` - サーバーの状態と起動時間を表示します
- `/info` - 指定したサーバーの詳細情報を表示します

## セットアップ

1. 必要なパッケージをインストール:
```bash
npm install
```

2. `.env`ファイルを作成し、以下の環境変数を設定:
```
# Discord Bot設定
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_guild_id

# ConoHa API設定
CONOHA_TENANT_ID=your_tenant_id
CONOHA_API_USERNAME=your_api_username
CONOHA_API_PASSWORD=your_api_password
CONOHA_SERVER_ID=your_server_id
CONOHA_IDENTITY_URL=https://identity.tyo1.conoha.io/v2.0
CONOHA_COMPUTE_URL=https://compute.tyo1.conoha.io/v2
```

3. ボットを起動:
```bash
node bot.js
```

## コマンドの説明

### `/start`
Valheimサーバーを起動します。サーバーが起動中の場合、既に起動していることを通知します。

### `/stop`
Valheimサーバーを停止します。サーバーが停止中の場合、既に停止していることを通知します。

### `/status`
サーバーの現在の状態（起動中/停止中）と起動時間を表示します。

### `/info`
指定したサーバーの詳細情報を表示します。以下の情報が含まれます：
- サーバー名
- サーバーID
- 状態
- 起動時間
- プライベートIPv4アドレス
- プライベートIPv6アドレス
- フレーバー（インスタンスタイプ）
- イメージ
- 作成日時
- 更新日時

## 注意事項

- サーバーの起動/停止には数分かかる場合があります
- サーバーの状態確認はリアルタイムで更新されます
- 起動時間は日本時間（JST）で表示されます

## 前提条件

- Node.js 18.x
- ConoHaアカウント
- Discord Application Public Key
- ConoHa VPSインスタンス（Valheimサーバー）

## アーキテクチャ

- Discord Bot
- ConoHa VPSインスタンス（Valheimサーバー）
- ConoHa API

## セキュリティ

- 環境変数による機密情報の管理
- Discordインタラクションの署名検証
- ConoHa API認証トークンの管理

## ライセンス

MIT 