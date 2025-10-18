import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import api from '../api';

const FareRanges = () => {
  const [fareRanges, setFareRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    min_km: '',
    max_km: '',
    rate_per_km: ''
  });

  useEffect(() => {
    fetchFareRanges();
  }, []);

  const fetchFareRanges = async () => {
    try {
      const response = await api.get('/admin/fare-ranges');
      setFareRanges(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fare ranges:', error);
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await api.post('/admin/fare-ranges', {
        min_km: parseFloat(formData.min_km),
        max_km: parseFloat(formData.max_km),
        rate_per_km: parseFloat(formData.rate_per_km)
      });
      
      setIsAdding(false);
      setFormData({ min_km: '', max_km: '', rate_per_km: '' });
      fetchFareRanges();
      alert('بازه نرخ با موفقیت اضافه شد');
    } catch (error) {
      console.error('Error adding fare range:', error);
      alert(error.response?.data?.detail || 'خطا در افزودن بازه نرخ');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/admin/fare-ranges/${id}`, {
        min_km: parseFloat(formData.min_km),
        max_km: parseFloat(formData.max_km),
        rate_per_km: parseFloat(formData.rate_per_km)
      });
      
      setEditingId(null);
      setFormData({ min_km: '', max_km: '', rate_per_km: '' });
      fetchFareRanges();
      alert('بازه نرخ با موفقیت به‌روزرسانی شد');
    } catch (error) {
      console.error('Error updating fare range:', error);
      alert(error.response?.data?.detail || 'خطا در به‌روزرسانی بازه نرخ');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این بازه نرخ اطمینان دارید؟')) {
      return;
    }

    try {
      await api.delete(`/admin/fare-ranges/${id}`);
      fetchFareRanges();
      alert('بازه نرخ با موفقیت حذف شد');
    } catch (error) {
      console.error('Error deleting fare range:', error);
      alert('خطا در حذف بازه نرخ');
    }
  };

  const startEdit = (range) => {
    setEditingId(range.id);
    setFormData({
      min_km: range.min_km,
      max_km: range.max_km,
      rate_per_km: range.rate_per_km
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ min_km: '', max_km: '', rate_per_km: '' });
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ min_km: '', max_km: '', rate_per_km: '' });
  };

  if (loading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">جدول نرخ کرایه</h1>
        {!isAdding && !editingId && (
          <button
            onClick={startAdd}
            className="bg-snabb hover:bg-snabb-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            افزودن بازه جدید
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>توضیحات:</strong> در این بخش می‌توانید بازه‌های نرخ کرایه را بر اساس مسافت تعیین کنید. 
          برای مثال: سفرهای 1 تا 3 کیلومتری با نرخ 20 افغانی، سفرهای 4 تا 7 کیلومتری با نرخ 16 افغانی و ...
        </p>
      </div>

      {/* Add New Form */}
      {isAdding && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">افزودن بازه نرخ جدید</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداقل کیلومتر
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.min_km}
                onChange={(e) => setFormData({ ...formData, min_km: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
                placeholder="مثلاً 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر کیلومتر
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.max_km}
                onChange={(e) => setFormData({ ...formData, max_km: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
                placeholder="مثلاً 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نرخ هر کیلومتر (افغانی)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.rate_per_km}
                onChange={(e) => setFormData({ ...formData, rate_per_km: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
                placeholder="مثلاً 20"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              ذخیره
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              لغو
            </button>
          </div>
        </div>
      )}

      {/* Fare Ranges Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                بازه مسافت (کیلومتر)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نرخ هر کیلومتر (افغانی)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                مثال کرایه (10 کیلومتر)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fareRanges.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  هیچ بازه نرخی تعریف نشده است. برای افزودن بازه جدید روی دکمه "افزودن بازه جدید" کلیک کنید.
                </td>
              </tr>
            ) : (
              fareRanges.map((range) => (
                <tr key={range.id} className="hover:bg-gray-50">
                  {editingId === range.id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.min_km}
                            onChange={(e) => setFormData({ ...formData, min_km: e.target.value })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                          />
                          <span className="py-1">تا</span>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.max_km}
                            onChange={(e) => setFormData({ ...formData, max_km: e.target.value })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.rate_per_km}
                          onChange={(e) => setFormData({ ...formData, rate_per_km: e.target.value })}
                          className="w-32 px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(10 * parseFloat(formData.rate_per_km || 0)).toFixed(0)} افغانی
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(range.id)}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          >
                            <Save className="h-4 w-4" />
                            ذخیره
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                          >
                            <X className="h-4 w-4" />
                            لغو
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">
                          از {range.min_km} تا {range.max_km} کیلومتر
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-bold">
                          {range.rate_per_km} افغانی
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {(10 * range.rate_per_km).toFixed(0)} افغانی
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(range)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDelete(range.id)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Example Pricing Table */}
      {fareRanges.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">نمونه قیمت‌گذاری</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[2, 5, 10, 20].map((distance) => {
              // Calculate price based on fare ranges
              let price = 0;
              const matchingRange = fareRanges.find(r => distance >= r.min_km && distance <= r.max_km);
              if (matchingRange) {
                price = distance * matchingRange.rate_per_km;
              } else if (fareRanges.length > 0 && distance > fareRanges[fareRanges.length - 1].max_km) {
                price = distance * fareRanges[fareRanges.length - 1].rate_per_km;
              }

              return (
                <div key={distance} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">{distance} کیلومتر</p>
                  <p className="text-xl font-bold text-snabb">{price.toFixed(0)} افغانی</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FareRanges;
