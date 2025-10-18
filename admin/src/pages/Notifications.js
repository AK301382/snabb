import React, { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../api';

const Notifications = () => {
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await api.post('/admin/notifications', {
        message: message,
        role: targetRole === 'all' ? null : targetRole
      });
      alert('اعلان با موفقیت ارسال شد');
      setMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('خطا در ارسال اعلان');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">سیستم اعلان‌ها</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              گیرندگان
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
            >
              <option value="all">همه کاربران</option>
              <option value="driver">فقط رانندگان</option>
              <option value="passenger">فقط مسافران</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              پیام
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
              placeholder="متن پیام خود را وارد کنید..."
            />
          </div>

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="w-full bg-snabb hover:bg-snabb-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="h-5 w-5" />
            {sending ? 'در حال ارسال...' : 'ارسال اعلان'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Notifications;
