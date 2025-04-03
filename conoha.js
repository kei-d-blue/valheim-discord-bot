const axios = require('axios');

class ConoHaClient {
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

  formatDate(dateString) {
    if (!dateString) return '未起動';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

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

  async getServerDetails(serverId) {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await axios.get(`${this.computeURL}/servers/${serverId}`, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

      const server = response.data.server;
      const ipv4 = server.addresses?.private?.find(addr => addr.version === 4)?.addr || '未設定';
      const ipv6 = server.addresses?.private?.find(addr => addr.version === 6)?.addr || '未設定';
      const flavor = server.flavor?.name || '不明';
      const image = server.image?.name || '不明';
      const created = this.formatDate(server.created);
      const updated = this.formatDate(server.updated);
      const launchedAt = this.formatDate(server['OS-SRV-USG:launched_at']);

      return `**サーバー詳細情報**\n\n` +
             `- 名前: ${server.name}\n` +
             `- ID: ${server.id}\n` +
             `- 状態: ${server.status}\n` +
             `- 起動時間: ${launchedAt}\n` +
             `- プライベートIPv4: ${ipv4}\n` +
             `- プライベートIPv6: ${ipv6}\n` +
             `- フレーバー: ${flavor}\n` +
             `- イメージ: ${image}\n` +
             `- 作成日時: ${created}\n` +
             `- 更新日時: ${updated}`;
    } catch (error) {
      console.error('サーバー詳細取得エラー:', error.response?.data || error.message);
      throw error;
    }
  }

  async startServer() {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await axios.post(`${this.computeURL}/servers/${this.serverId}/action`, {
        'os-start': null
      }, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

      return 'サーバーを起動しました。';
    } catch (error) {
      console.error('サーバー起動エラー:', error.response?.data || error.message);
      throw error;
    }
  }

  async stopServer() {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await axios.post(`${this.computeURL}/servers/${this.serverId}/action`, {
        'os-stop': null
      }, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

      return 'サーバーを停止しました。';
    } catch (error) {
      console.error('サーバー停止エラー:', error.response?.data || error.message);
      throw error;
    }
  }

  async getServerStatus() {
    try {
      if (!this.token) await this.authenticate();
      
      const response = await axios.get(`${this.computeURL}/servers/${this.serverId}`, {
        headers: {
          'X-Auth-Token': this.token,
          'Content-Type': 'application/json'
        }
      });

      const status = response.data.server.status;
      const launchedAt = this.formatDate(response.data.server['OS-SRV-USG:launched_at']);
      return `サーバーの状態: ${status}\n起動時間: ${launchedAt}`;
    } catch (error) {
      console.error('サーバー状態取得エラー:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new ConoHaClient(); 