'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProgressChartProps {
  title: string;
  data: ChartDataPoint[];
  totalValue: number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export default function ProgressChart({ title, data, totalValue, trend }: ProgressChartProps) {
  const t = useTranslations('Dashboard.Common');
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalValue}</p>
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
            {trend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {trend.value}
          </div>
        )}
      </div>

      {/* Simple bar chart */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="w-full sm:w-20 text-sm text-gray-600 flex-shrink-0 font-medium">
              {item.label}
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${item.color || 'bg-blue-500'
                      }`}
                    style={{
                      width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                      minWidth: item.value > 0 ? '8px' : '0px'
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-10 text-sm text-gray-900 font-medium text-right flex-shrink-0">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">{t('noData')}</p>
          <p className="text-xs text-gray-400">{t('noDataDesc')}</p>
        </div>
      )}
    </div>
  );
}