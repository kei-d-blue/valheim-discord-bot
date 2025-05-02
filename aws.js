const { EC2Client, StartInstancesCommand, StopInstancesCommand, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
const timeCalculator = require('./timeCalculator');

/**
 * AWS EC2 APIクライアントクラス
 * EC2インスタンスの管理を行う
 */
class AWSClient {
  /**
   * AWSClientのコンストラクタ
   * 環境変数から設定を読み込み、必要な環境変数が設定されているか検証する
   */
  constructor() {
    this.region = process.env.AWS_REGION;
    this.instanceId = process.env.AWS_INSTANCE_ID;
    this.client = new EC2Client({ region: this.region });

    this.validateConfig();
  }

  /**
   * 必要な環境変数が設定されているか検証する
   * @throws {Error} 必要な環境変数が設定されていない場合
   */
  validateConfig() {
    const requiredEnvVars = [
      'AWS_REGION',
      'AWS_INSTANCE_ID',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`必要な環境変数が設定されていません: ${missingVars.join(', ')}`);
    }
  }

  /**
   * インスタンスの状態を取得する
   * @returns {Promise<string>} インスタンスの状態
   * @throws {Error} インスタンス状態の取得に失敗した場合
   */
  async getServerState() {
    console.log('インスタンス状態の取得を開始します...');
    try {
      const command = new DescribeInstancesCommand({
        InstanceIds: [this.instanceId]
      });

      const response = await this.client.send(command);
      const state = response.Reservations[0].Instances[0].State.Name;
      
      console.log('インスタンス状態の取得が完了しました。状態:', state);
      return state;
    } catch (error) {
      console.error('インスタンス状態取得エラー:', error);
      throw error;
    }
  }

  /**
   * インスタンスを起動する
   * @returns {Promise<string>} 起動結果のメッセージ
   * @throws {Error} インスタンスの起動に失敗した場合
   */
  async startServer() {
    console.log('インスタンス起動処理を開始します...');
    try {
      const currentState = await this.getServerState();
      
      if (currentState === 'running') {
        console.log('インスタンスは既に起動中です。');
        return 'インスタンスは既に起動中です。';
      }
      
      const command = new StartInstancesCommand({
        InstanceIds: [this.instanceId]
      });

      await this.client.send(command);
      timeCalculator.setStartTime(new Date());
      
      console.log('インスタンス起動処理が完了しました。');
      return 'インスタンスを起動しました。';
    } catch (error) {
      console.error('インスタンス起動エラー:', error);
      throw error;
    }
  }

  /**
   * インスタンスを停止する
   * @returns {Promise<string>} 停止結果のメッセージ
   * @throws {Error} インスタンスの停止に失敗した場合
   */
  async stopServer() {
    console.log('インスタンス停止処理を開始します...');
    try {
      const currentState = await this.getServerState();
      
      if (currentState === 'stopped') {
        console.log('インスタンスは既に停止中です。');
        return 'インスタンスは既に停止中です。';
      }
      
      const command = new StopInstancesCommand({
        InstanceIds: [this.instanceId]
      });

      await this.client.send(command);

      const elapsedTime = timeCalculator.calculateElapsedTime();
      const cost = timeCalculator.calculateCost();

      timeCalculator.resetStartTime();

      console.log('インスタンス停止処理が完了しました。稼働時間:', elapsedTime, '料金:', cost);
      return `インスタンスを停止しました。\n` +
             `稼働時間: ${elapsedTime}\n` +
             `料金: ${cost}`;
    } catch (error) {
      console.error('インスタンス停止エラー:', error);
      throw error;
    }
  }

  /**
   * インスタンスの状態と起動時間を取得する
   * @returns {Promise<string>} インスタンスの状態と起動時間
   * @throws {Error} インスタンス状態の取得に失敗した場合
   */
  async getServerStatus() {
    console.log('インスタンス詳細情報の取得を開始します...');
    try {
      const command = new DescribeInstancesCommand({
        InstanceIds: [this.instanceId]
      });

      const response = await this.client.send(command);
      const instance = response.Reservations[0].Instances[0];
      
      const elapsedTime = timeCalculator.calculateElapsedTime();
      const cost = timeCalculator.calculateCost();

      console.log('インスタンス詳細情報の取得が完了しました。状態:', instance.State.Name);
      return `**インスタンス詳細情報**\n\n` +
             `- インスタンスID: ${instance.InstanceId}\n` +
             `- 状態: ${instance.State.Name}\n` +
             `- 稼働時間: ${elapsedTime}\n` +
             `- 料金: ${cost}\n` +
             `- パブリックIP: ${instance.PublicIpAddress || '未設定'}\n` +
             `- プライベートIP: ${instance.PrivateIpAddress || '未設定'}\n`;
    } catch (error) {
      console.error('インスタンス状態取得エラー:', error);
      throw error;
    }
  }
}

module.exports = new AWSClient(); 