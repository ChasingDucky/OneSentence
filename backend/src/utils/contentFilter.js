// 内容过滤工具
// 检测敏感词、个人信息等

const sensitiveKeywords = [
  // 中文敏感词示例
  '色情', '暴力', '政治敏感词',
  // 英文敏感词示例
  'porn', 'violence', 'hate',
];

const piiPatterns = [
  // 邮箱
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // 电话号码（中国）
  /1[3-9]\d{9}/g,
  // URL
  /https?:\/\/[^\s]+/g,
  // 微信/QQ等社交账号提示
  /[微vV][信xX][:：\s]*[a-zA-Z0-9_-]+/gi,
  /[QqＱｑ]{2}[:：\s]*[0-9]+/g,
];

/**
 * 检测文本是否包含敏感内容
 * @param {string} text 待检测文本
 * @returns {Object} { isClean: boolean, reason: string }
 */
function filterContent(text) {
  if (!text || typeof text !== 'string') {
    return { isClean: false, reason: 'Invalid text' };
  }

  // 检查敏感关键词
  const lowerText = text.toLowerCase();
  for (const keyword of sensitiveKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return { isClean: false, reason: 'Contains sensitive keywords' };
    }
  }

  // 检查个人信息
  for (const pattern of piiPatterns) {
    if (pattern.test(text)) {
      return { isClean: false, reason: 'Contains personal information (email/phone/social account)' };
    }
  }

  // 检查文本长度
  if (text.length > 140) {
    return { isClean: false, reason: 'Text too long (max 140 characters)' };
  }

  // 检查是否为空或只有空格
  if (text.trim().length === 0) {
    return { isClean: false, reason: 'Text is empty' };
  }

  return { isClean: true, reason: null };
}

/**
 * 清理文本（移除多余空格等）
 * @param {string} text
 * @returns {string}
 */
function cleanText(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ')  // 多个空格替换为单个
    .replace(/\n+/g, '\n') // 多个换行替换为单个
    .substring(0, 140);    // 确保不超过140字符
}

module.exports = {
  filterContent,
  cleanText,
};
