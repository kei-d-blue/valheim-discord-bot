const axios = require('axios');
const timeCalculator = require('./timeCalculator');

/**
 * ConoHa APIクライアントクラス
 * ConoHa VPSインスタンスの管理を行う
 */
class ConoHaClient {
  /**
   * ConoHaClientのコンストラクタ
   * 環境変数から設定を読み込み、必要な環境変数が設定されているか検証する
   */
  constructor() {
    this.identityURL = process.env.CONOHA_IDENTITY_URL || 'https://identity.tyo1.conoha.io/v2.0';
    this.computeURL = process.env.CONOHA_COMPUTE_URL || 'https://compute.tyo1.conoha.io/v2';
    this.tenantId = process.env.CONOHA_TENANT_ID;
    this.apiUsername = process.env.CONOHA_API_USERNAME;
    this.apiPassword = process.env.CONOHA_API_PASSWORD;
    this.serverId = process.env.CONOHA_SERVER_ID;
    this.token = null;
    this.tokenExpiration = null; // トークンの有効期限を保持

    // 必要な環境変数のチェック
    this.validateConfig();
  }

  /**
   * 必要な環境変数が設定されているか検証する
   * @throws {Error} 必要な環境変数が設定されていない場合
   */
  validateConfig() {
    const requiredEnvVars = [
      'CONOHA_TENANT_ID',
      'CONOHA_API_USERNAME',
      'CONOHA_API_PASSWORD',
      'CONOHA_SERVER_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`必要な環境変数が設定されていません: ${missingVars.join(', ')}`);
    }
  }

  /**
   * トークンが有効かどうかチェックする
   * @returns {boolean} トークンが有効な場合はtrue
   */
  isTokenValid() {
    if (!this.token || !this.tokenExpiration) {
      return false;
    }
    // 現在時刻と有効期限を比較（1分のバッファを設定）
    return new Date() < new Date(this.tokenExpiration - 60000);
  }

  /**
   * 必要に応じてトークンを更新する
   */
  async ensureValidToken() {
    if (!this.isTokenValid()) {
      await this.authenticate();
    }
  }

  /**
   * ConoHa APIの認証を行う
   * @returns {Promise<string>} 認証トークン
   * @throws {Error} 認証に失敗した場合
   */
  async authenticate() {
    console.log('ConoHa API認証を開始します...');
    try {
      const response = await axios.post(`${this.identityURL}/auth/tokens`, {
        auth: {
          identity: {
            methods: ['password'],
            password: {
              user: {
                name: this.apiUsername,
                password: this.apiPassword,
              }
            }
          },
          scope: {
            project: {
              id: this.tenantId
            }
          }
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.token = response.headers['x-subject-token'];
      if (!this.token) {
        throw new Error('認証トークンが見つかりませんでした');
      }

      // トークンの有効期限を24時間後に設定
      this.tokenExpiration = Date.now() + (24 * 60 * 60 * 1000);
      console.log('ConoHa API認証が完了しました。トークンの有効期限:', new Date(this.tokenExpiration).toLocaleString('ja-JP'));
      
      return this.token;
    } catch (error) {
      console.error('ConoHa認証エラー:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * サーバーの状態を取得する
   * @returns {Promise<string>} サーバーの状態
   * @throws {Error} サーバー状態の取得に失敗した場合
   */
  async getServerState() {
    console.log('サーバー状態の取得を開始します...');
    try {
      await this.ensureValidToken();
      
      const response = await axios.get(`${this.computeURL}/servers/${this.serverId}`, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

      console.log('サーバー状態の取得が完了しました。状態:', response.data.server.status);
      return response.data.server.status;
    } catch (error) {
      console.error('サーバー状態取得エラー:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * サーバーを起動する
   * @returns {Promise<string>} 起動結果のメッセージ
   * @throws {Error} サーバーの起動に失敗した場合
   */
  async startServer() {
    console.log('サーバー起動処理を開始します...');
    try {
      await this.ensureValidToken();
      // サーバーの状態を確認
      const currentState = await this.getServerState();
      
      // すでに起動中の場合はメッセージを返す
      if (currentState === 'ACTIVE') {
        console.log('サーバーは既に起動中です。');
        return 'サーバーは既に起動中です。';
      }
      
      const response = await axios.post(`${this.computeURL}/servers/${this.serverId}/action`, {
        'os-start': null
      }, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

      // 起動時間を記録
      timeCalculator.setStartTime(new Date());
      console.log('サーバー起動処理が完了しました。');
      return 'サーバーを起動しました。';
    } catch (error) {
      console.error('サーバー起動エラー:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * サーバーを停止する
   * @returns {Promise<string>} 停止結果のメッセージ
   * @throws {Error} サーバーの停止に失敗した場合
   */
  async stopServer() {
    console.log('サーバー停止処理を開始します...');
    try {
      await this.ensureValidToken();
      // サーバーの状態を確認
      const currentState = await this.getServerState();
      
      // すでに停止中の場合はメッセージを返す
      if (currentState === 'SHUTOFF') {
        console.log('サーバーは既に停止中です。');
        return 'サーバーは既に停止中です。';
      }
      
      const response = await axios.post(`${this.computeURL}/servers/${this.serverId}/action`, {
        'os-stop': null
      }, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

      // 稼働時間と料金を計算
      const elapsedTime = timeCalculator.calculateElapsedTime();
      const cost = timeCalculator.calculateCost();

      // 起動時間をリセット
      timeCalculator.resetStartTime();

      console.log('サーバー停止処理が完了しました。稼働時間:', elapsedTime, '料金:', cost);
      return `サーバーを停止しました。\n` +
             `稼働時間: ${elapsedTime}\n` +
             `料金: ${cost}`;
    } catch (error) {
      console.error('サーバー停止エラー:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * サーバーの状態と起動時間を取得する
   * @returns {Promise<string>} サーバーの状態と起動時間
   * @throws {Error} サーバー状態の取得に失敗した場合
   */
  async getServerStatus() {
    console.log('サーバー詳細情報の取得を開始します...');
    try {
      await this.ensureValidToken();
      
      const response = await axios.get(`${this.computeURL}/servers/${this.serverId}`, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

      const server = response.data.server;
      // 最初のネットワークインターフェースのアドレスを取得
      const networkInterface = Object.values(server.addresses)[0];
      const ipv4 = networkInterface?.find(addr => addr.version === 4)?.addr || '未設定';
      const ipv6 = networkInterface?.find(addr => addr.version === 6)?.addr || '未設定';
      const elapsedTime = timeCalculator.calculateElapsedTime();
      const cost = timeCalculator.calculateCost();

      console.log('サーバー詳細情報の取得が完了しました。状態:', server.status);
      return `**サーバー詳細情報**\n\n` +
             `- 名前: ${server.name}\n` +
             `- ID: ${server.id}\n` +
             `- 状態: ${server.status}\n` +
             `- 稼働時間: ${elapsedTime}\n` +
             `- 料金: ${cost}\n` +
             `- プライベートIPv4: ${ipv4}\n` +
             `- プライベートIPv6: ${ipv6}\n`;
    } catch (error) {
      console.error('サーバー状態取得エラー:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new ConoHaClient(); 