'use client';

import { ReactElement } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  isSelected?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  subtitle,
  trend,
  onClick,
  isSelected
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm p-6 border transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''
        } ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/10' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {trend && (
          <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}