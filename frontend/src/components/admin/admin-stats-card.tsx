'use client';

import { ReactElement } from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  subtitle?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    period: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function AdminStatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  subtitle,
  trend,
  action
}: AdminStatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>

        {trend && (
          <div className={`text-right ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <p className="text-sm font-medium">
              {trend.isPositive ? '+' : ''}{trend.value}
            </p>
            <p className="text-xs text-gray-500">{trend.period}</p>
          </div>
        )}
      </div>

      {subtitle && (
        <div className="text-sm text-gray-500 mb-3">{subtitle}</div>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}