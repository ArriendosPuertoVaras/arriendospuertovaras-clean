'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Cabañas del Sur', Ventas: 42500 },
  { name: 'Turismo Extremo', Ventas: 31000 },
  { name: 'Depto Central', Ventas: 22000 },
  { name: 'Kayaks & Más', Ventas: 18500 },
  { name: 'Lodge del Lago', Ventas: 9800 },
];

export default function TopOperatorsChart() {
  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 5 Operadores por Ventas</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(value/1000)}k`} />
          <YAxis type="category" dataKey="name" width={100} stroke="#64748b" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} />
          <Bar dataKey="Ventas" fill="#8884d8" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}