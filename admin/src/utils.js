import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' افغانی';
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatDistance(km) {
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(km) + ' کیلومتر';
}

export function getTripStatusLabel(status) {
  const labels = {
    pending: 'در انتظار',
    accepted: 'پذیرفته شده',
    in_progress: 'در حال انجام',
    completed: 'تکمیل شده',
    cancelled: 'لغو شده'
  };
  return labels[status] || status;
}

export function getTripStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
