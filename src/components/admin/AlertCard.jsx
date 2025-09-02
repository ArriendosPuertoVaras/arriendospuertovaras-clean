import React from 'react';
import { Button } from '@/components/ui/button';

export default function AlertCard({ 
  title, 
  value, 
  tone = 'info', 
  icon: Icon,
  actionText,
  onAction,
  className = "" 
}) {
  const toneStyles = {
    info: 'border-l-4 border-l-blue-500 bg-blue-50',
    warning: 'border-l-4 border-l-yellow-500 bg-yellow-50',
    danger: 'border-l-4 border-l-red-500 bg-red-50',
    success: 'border-l-4 border-l-green-500 bg-green-50',
    violet: 'border-l-4 border-l-purple-500 bg-purple-50'
  };

  const valueStyles = {
    info: 'text-blue-900',
    warning: 'text-yellow-900',
    danger: 'text-red-900',
    success: 'text-green-900',
    violet: 'text-purple-900'
  };

  return (
    <div className={`p-4 rounded-lg ${toneStyles[tone]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${valueStyles[tone]}`} />}
          <h3 className="text-sm font-medium text-slate-700">{title}</h3>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className={`text-xl font-bold ${valueStyles[tone]}`}>{value}</p>
        {actionText && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-xs"
            onClick={onAction}
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}