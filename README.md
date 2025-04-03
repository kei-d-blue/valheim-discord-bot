# Valheim Discord Bot

ValheimサーバーをDiscordから管理するためのボットです。ConoHa VPSインスタンスの起動/停止と状態確認ができます。

## 機能

- `/start` - サーバーを起動
- `/stop` - サーバーを停止
- `/status` - サーバーの状態と稼働時間を表示

## セットアップ

### 必要な環境変数

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
CONOHA_TENANT_ID=your_tenant_id
CONOHA_API_USERNAME=your_api_username
CONOHA_API_PASSWORD=your_api_password
CONOHA_SERVER_ID=your_server_id
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
- サーバーを起動します
- すでに起動中の場合はその旨を表示します

### `/stop`
- サーバーを停止します
- 稼働時間と料金を表示します
- すでに停止中の場合はその旨を表示します

### `/status`
- サーバーの状態を表示します
- 稼働時間と料金を表示します
- IPアドレス情報も表示します

## 注意事項

- サーバーの起動/停止には数分かかる場合があります
- 料金は1時間あたり7.5円で計算されます
- 1時間未満の使用は1時間として計算されます
- サーバーの状態は定期的に更新されます

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