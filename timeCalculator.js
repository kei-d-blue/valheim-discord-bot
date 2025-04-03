/**
 * 経過時間を計算するためのクラス
 */
class TimeCalculator {
  /**
   * TimeCalculatorのコンストラクタ
   */
  constructor() {
    this.startTime = null;
  }

  /**
   * 開始時間を設定する
   * @param {Date|string} time - 開始時間（DateオブジェクトまたはISO文字列）
   */
  setStartTime(time) {
    this.startTime = time instanceof Date ? time : new Date(time);
  }

  /**
   * 開始時間をリセットする
   */
  resetStartTime() {
    this.startTime = null;
  }

  /**
   * 経過時間を計算する
   * @param {Date} [endTime] - 終了時間（省略時は現在時刻）
   * @returns {string} 経過時間の文字列
   */
  calculateElapsedTime(endTime = new Date()) {
    if (!this.startTime) return '未計測';
    
    const diff = endTime - this.startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}時間${minutes}分${seconds}秒`;
  }

  /**
   * 日付文字列を日本時間のフォーマットに変換する
   * @param {string} dateString - 変換する日付文字列
   * @returns {string} 日本時間でフォーマットされた日付文字列
   */
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
}

module.exports = new TimeCalculator(); 