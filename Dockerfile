# Node.jsの公式イメージをベースに使用
FROM node:18-slim

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# 環境変数の設定
ENV NODE_ENV=production

# アプリケーションを起動
CMD ["node", "bot.js"] 