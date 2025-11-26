const Message = require('../models/Message');
const Pairing = require('../models/Pairing');

/**
 * 随机配对服务
 * 将今天发布的消息进行随机配对
 */
class PairingService {
  /**
   * 执行今日配对
   * 应该由定时任务调用（例如每小时或特定时间点）
   */
  static async performDailyPairing() {
    try {
      console.log('Starting daily pairing process...');

      // 获取今天所有未配对的消息
      const unpairedMessages = await Message.getTodayUnpairedMessages();

      if (unpairedMessages.length < 2) {
        console.log('Not enough messages to pair (need at least 2)');
        return { success: true, pairingsCreated: 0, message: 'Not enough messages' };
      }

      // 打乱消息顺序以实现随机配对
      const shuffled = this.shuffleArray([...unpairedMessages]);

      let pairingsCreated = 0;

      // 两两配对
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        const msg1 = shuffled[i];
        const msg2 = shuffled[i + 1];

        // 检查是否在近期已配对过
        const hasRecent = await Pairing.hasRecentPairing(msg1.anon_id, msg2.anon_id, 7);

        if (!hasRecent) {
          // 创建双向配对
          await Pairing.create(msg1.msg_id, msg2.msg_id);
          await Pairing.create(msg2.msg_id, msg1.msg_id);

          pairingsCreated += 2;
          console.log(`Paired messages ${msg1.msg_id} <-> ${msg2.msg_id}`);
        } else {
          console.log(`Skipped pairing ${msg1.msg_id} <-> ${msg2.msg_id} (recent history)`);
        }
      }

      // 如果有奇数个消息，最后一个暂时不配对
      if (shuffled.length % 2 === 1) {
        console.log(`One message left unpaired: ${shuffled[shuffled.length - 1].msg_id}`);
      }

      console.log(`Daily pairing completed. Created ${pairingsCreated} pairings.`);

      return {
        success: true,
        pairingsCreated,
        totalMessages: unpairedMessages.length,
        unpaired: shuffled.length % 2
      };

    } catch (error) {
      console.error('Error in daily pairing:', error);
      throw error;
    }
  }

  /**
   * Fisher-Yates 洗牌算法
   */
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 获取用户今天收到的消息
   */
  static async getTodayReceivedMessage(anonId) {
    return await Pairing.getTodayReceivedByAnonId(anonId);
  }
}

module.exports = PairingService;
