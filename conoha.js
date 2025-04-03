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
   * ConoHa APIの認証を行う
   * @returns {Promise<string>} 認証トークン
   * @throws {Error} 認証に失敗した場合
   */
  async authenticate() {
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

      // レスポンスヘッダーからトークンを取得
      this.token = response.headers['x-subject-token'];
      if (!this.token) {
        throw new Error('認証トークンが見つかりませんでした');
      }

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
    try {
      if (!this.token) await this.authenticate();
      
      const response = await axios.get(`${this.computeURL}/servers/${this.serverId}`, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

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
    try {
      // サーバーの状態を確認
      const currentState = await this.getServerState();
      
      // すでに起動中の場合はメッセージを返す
      if (currentState === 'ACTIVE') {
        return 'サーバーは既に起動中です。';
      }

      if (!this.token) await this.authenticate();
      
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
    try {
      // サーバーの状態を確認
      const currentState = await this.getServerState();
      
      // すでに停止中の場合はメッセージを返す
      if (currentState === 'SHUTOFF') {
        return 'サーバーは既に停止中です。';
      }

      if (!this.token) await this.authenticate();
      
      const response = await axios.post(`${this.computeURL}/servers/${this.serverId}/action`, {
        'os-stop': null
      }, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

      // 稼働時間を計算
      const elapsedTime = timeCalculator.calculateElapsedTime();

      // 起動時間をリセット
      timeCalculator.resetStartTime();

      return `サーバーを停止しました。\n稼働時間: ${elapsedTime}`;
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
    try {
      if (!this.token) await this.authenticate();
      
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

      return `**サーバー詳細情報**\n\n` +
             `- 名前: ${server.name}\n` +
             `- ID: ${server.id}\n` +
             `- 状態: ${server.status}\n` +
             `- 稼働時間: ${elapsedTime}\n` +
             `- プライベートIPv4: ${ipv4}\n` +
             `- プライベートIPv6: ${ipv6}\n`;
    } catch (error) {
      console.error('サーバー状態取得エラー:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new ConoHaClient(); 