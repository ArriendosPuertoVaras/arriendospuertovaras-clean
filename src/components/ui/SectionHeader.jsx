import React from 'react';

export default function SectionHeader({ title, description, className = '' }) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight mb-2" style={{color: 'var(--neu-text)'}}>
        {title}
      </h2>
      {description && (
        <p className="text-lg" style={{color: 'var(--neu-text-light)'}}>
          {description}
        </p>
      )}
    </div>
  );
}