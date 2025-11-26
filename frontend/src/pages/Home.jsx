import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageAPI, reactionAPI, reportAPI } from '../services/api';
import { removeToken } from '../utils/auth';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [todayData, setTodayData] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const maxChars = 140;

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      const response = await messageAPI.getToday();
      setTodayData(response.data);
    } catch (err) {
      console.error('Failed to fetch today data:', err);
      if (err.response?.status === 401) {
        removeToken();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setMessageText(text);
      setCharCount(text.length);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError('请输入内容');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await messageAPI.create({ text: messageText, language: 'zh' });
      setMessageText('');
      setCharCount(0);
      await fetchTodayData();
    } catch (err) {
      setError(err.response?.data?.reason || err.response?.data?.error || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (reactionType) => {
    if (!todayData?.received) return;

    try {
      // 假设 msg_id 在 pairingId 中可以获取
      // 实际需要调整 API 返回结构
      await reactionAPI.add(todayData.received.pairingId, reactionType);
      await fetchTodayData();
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert('请填写举报原因');
      return;
    }

    try {
      // 需要实际的 msg_id
      await reportAPI.create(todayData.received.pairingId, reportReason);
      setShowReportModal(false);
      setReportReason('');
      alert('举报已提交，我们会尽快处理');
    } catch (err) {
      alert('举报失败，请重试');
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  if (loading) {
    return <div className="container loading">加载中...</div>;
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>One Sentence Today</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/history')}>
            历史
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            退出
          </button>
        </div>
      </header>

      <div className="container">
        {/* 发布区域 */}
        {!todayData?.hasSent ? (
          <div className="card compose-card fade-in">
            <h2 className="section-title">✍️ 今天你想说什么？</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                className="textarea"
                value={messageText}
                onChange={handleMessageChange}
                placeholder="写下你的一句话..."
                disabled={submitting}
              />
              <div className="compose-footer">
                <span className={`char-count ${charCount > maxChars - 20 ? 'warning' : ''}`}>
                  {charCount} / {maxChars}
                </span>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !messageText.trim()}
                >
                  {submitting ? '发送中...' : '发送到宇宙'}
                </button>
              </div>
              {error && <div className="error-message mt-2">{error}</div>}
            </form>
            <p className="privacy-hint text-sm text-secondary mt-2">
              💡 提示：请勿分享个人信息（邮箱、电话、社交账号等）
            </p>
          </div>
        ) : (
          <div className="card sent-card fade-in">
            <h2 className="section-title">✅ 今天你说了</h2>
            <blockquote className="message-quote">
              "{todayData.sent.text}"
            </blockquote>
            <p className="text-sm text-secondary text-center">
              已发送 • 等待配对中
            </p>
          </div>
        )}

        {/* 接收区域 */}
        {todayData?.hasReceived && (
          <div className="card received-card fade-in">
            <h2 className="section-title">📬 今天你收到了</h2>
            <blockquote className="message-quote received">
              "{todayData.received.text}"
            </blockquote>

            <div className="reaction-buttons">
              <button
                className="reaction-btn"
                onClick={() => handleReaction('resonate')}
                title="共鸣"
              >
                ❤️ 共鸣
              </button>
              <button
                className="reaction-btn"
                onClick={() => handleReaction('curious')}
                title="好奇"
              >
                🤔 好奇
              </button>
              <button
                className="reaction-btn"
                onClick={() => handleReaction('applause')}
                title="鼓掌"
              >
                👏 鼓掌
              </button>
              <button
                className="reaction-btn"
                onClick={() => handleReaction('want_more')}
                title="想知道更多"
              >
                ✨ 想了解
              </button>
            </div>

            <div className="message-actions">
              <button
                className="text-btn"
                onClick={() => setShowReportModal(true)}
              >
                🚩 举报
              </button>
            </div>
          </div>
        )}

        {!todayData?.hasSent && (
          <div className="info-card text-center text-secondary">
            <p>💫 发布今天的一句话，即可收到来自陌生人的匿名句子</p>
          </div>
        )}
      </div>

      {/* 举报模态框 */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>举报不当内容</h3>
            <textarea
              className="textarea"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="请描述举报原因（至少10个字符）"
              minLength={10}
            />
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowReportModal(false)}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleReport}
                disabled={reportReason.length < 10}
              >
                提交举报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
