import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageAPI } from '../services/api';
import './History.css';

function History() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await messageAPI.getHistory(30);
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="container loading">加载中...</div>;
  }

  return (
    <div className="history-container">
      <header className="history-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回
        </button>
        <h1>历史消息</h1>
        <div style={{ width: '60px' }}></div>
      </header>

      <div className="container">
        {messages.length === 0 ? (
          <div className="empty-state card">
            <p className="text-secondary">还没有发布过消息</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
              发布第一句话
            </button>
          </div>
        ) : (
          <div className="history-list">
            {messages.map((msg) => (
              <div key={msg.msg_id} className="history-item card fade-in">
                <div className="history-date">{formatDate(msg.created_at)}</div>
                <blockquote className="message-quote">"{msg.text}"</blockquote>
                <div className="history-stats">
                  <span className="stat-item">
                    ❤️ {msg.reaction_count || 0} 个反应
                  </span>
                  <span className="stat-item">
                    ⭐ {msg.favorite_count || 0} 次收藏
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
