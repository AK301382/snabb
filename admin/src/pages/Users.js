import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Check, X } from 'lucide-react';
import api from '../api';
import { formatDate } from '../utils';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.includes(searchTerm) || u.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { is_active: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('خطا در به‌روزرسانی وضعیت');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('آیا مطمئن هستید؟')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('خطا در حذف کاربر');
    }
  };

  if (loading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">مدیریت کاربران</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام یا شماره..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-snabb"
          >
            <option value="all">همه نقش‌ها</option>
            <option value="driver">رانندگان</option>
            <option value="passenger">مسافران</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            مجموع: {filteredUsers.length} کاربر
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شماره</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نقش</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ماشین</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ ثبت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'driver' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'driver' ? 'راننده' : 'مسافر'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.car_model || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.is_active ? 'فعال' : 'غیرفعال'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
