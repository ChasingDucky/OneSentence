const express = require('express');
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { filterContent, cleanText } = require('../utils/contentFilter');
const PairingService = require('../services/pairingService');

const router = express.Router();

/**
 * POST /api/messages
 * 发布今日一句
 */
router.post('/', authenticateToken, validateRequest(schemas.createMessage), async (req, res) => {
  try {
    const { text, language } = req.body;
    const { anonId } = req.user;

    // 检查今天是否已发布
    const todayMessage = await Message.getTodayMessageByAnonId(anonId);
    if (todayMessage) {
      return res.status(400).json({
        error: 'You have already posted today',
        message: todayMessage
      });
    }

    // 清理文本
    const cleanedText = cleanText(text);

    // 内容过滤
    const filterResult = filterContent(cleanedText);
    if (!filterResult.isClean) {
      return res.status(400).json({
        error: 'Content not allowed',
        reason: filterResult.reason
      });
    }

    // 创建消息
    const message = await Message.create({
      anonId,
      text: cleanedText,
      language: language || 'zh'
    });

    res.status(201).json({
      message: 'Message posted successfully',
      data: message
    });

  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/messages/today
 * 获取今天发布的消息和收到的配对
 */
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const { anonId } = req.user;

    // 获取今天发布的消息
    const sentMessage = await Message.getTodayMessageByAnonId(anonId);

    // 获取今天收到的配对
    let receivedPairing = null;
    if (sentMessage) {
      receivedPairing = await PairingService.getTodayReceivedMessage(anonId);
    }

    res.json({
      sent: sentMessage || null,
      received: receivedPairing ? {
        text: receivedPairing.received_text,
        createdAt: receivedPairing.received_created_at,
        language: receivedPairing.received_language,
        reactionCount: receivedPairing.reaction_count,
        pairingId: receivedPairing.pairing_id
      } : null,
      hasSent: !!sentMessage,
      hasReceived: !!receivedPairing
    });

  } catch (error) {
    console.error('Get today messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/messages/history
 * 获取历史消息
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { anonId } = req.user;
    const limit = parseInt(req.query.limit) || 30;

    const history = await Message.getHistoryByAnonId(anonId, limit);

    res.json({
      messages: history,
      count: history.length
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/messages/:id
 * 获取单条消息详情
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
