import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  subtitle, 
  className = "" 
}) {
  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-slate-600" />}
          <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}