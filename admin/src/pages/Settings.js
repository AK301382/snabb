import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../api';
import { formatCurrency } from '../utils';

const Settings = () => {
  const [baseFare, setBaseFare] = useState(20);
  const [perKm, setPerKm] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPricingConfig();
  }, []);

  const fetchPricingConfig = async () => {
    try {
      const response = await api.get('/admin/pricing-config');
      setBaseFare(response.data.base_fare);
      setPerKm(response.data.per_km);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pricing config:', error);
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/admin/pricing-config', {
        base_fare: parseFloat(baseFare),
        per_km: parseFloat(perKm)
      });
      alert('تنظیمات با موفقیت ذخیره شد');
    } catch (error) {
      console.error('Error saving pricing config:', error);
      alert('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  const samplePrice = parseFloat(baseFare) + (parseFloat(perKm) * 10);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">تنظیمات سیستم</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">تنظیمات قیمت‌گذاری</h3>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              کرایه پایه (افغانی)
            </label>
            <input
              type="number"
              value={baseFare}
              onChange={(e) => setBaseFare(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نرخ هر کیلومتر (افغانی)
            </label>
            <input
              type="number"
              value={perKm}
              onChange={(e) => setPerKm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>مثال:</strong> برای یک سفر 10 کیلومتری، قیمت خواهد بود:
            </p>
            <p className="text-lg font-bold text-blue-900 mt-2">
              {formatCurrency(samplePrice)}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-snabb hover:bg-snabb-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
