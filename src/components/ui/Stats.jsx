import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'increase', // 'increase', 'decrease', 'neutral'
  icon: Icon,
  prefix = '',
  suffix = '',
  className = '',
  gradient = false
}) {
  const changeColors = {
    increase: 'text-emerald-600 bg-emerald-50',
    decrease: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  const TrendIcon = changeType === 'increase' ? TrendingUp : 
                    changeType === 'decrease' ? TrendingDown : Minus;

  return (
    <div className={`
      relative p-6 bg-white rounded-2xl border border-gray-100 
      shadow-lg shadow-gray-200/50 hover:shadow-xl 
      transition-all duration-300 hover:-translate-y-1
      overflow-hidden
      ${className}
    `}>
      {/* Background Gradient Decoration */}
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl" />
      )}
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {prefix}{value}{suffix}
              </span>
            </div>
          </div>
          {Icon && (
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        {change !== undefined && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${changeColors[changeType]}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{change}%</span>
            <span className="text-xs opacity-75">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatsGrid({ children, columns = 4, className = '' }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {children}
    </div>
  );
}

export function MiniStat({ label, value, icon: Icon, trend, className = '' }) {
  return (
    <div className={`flex items-center gap-3 p-4 bg-gray-50 rounded-xl ${className}`}>
      {Icon && (
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Icon className="w-4 h-4 text-purple-600" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
      {trend && (
        <div className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}
