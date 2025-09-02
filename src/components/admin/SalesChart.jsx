'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Hace 7d', Ventas: 12000, Comisión: 1800 },
  { name: 'Hace 6d', Ventas: 21000, Comisión: 3150 },
  { name: 'Hace 5d', Ventas: 15000, Comisión: 2250 },
  { name: 'Hace 4d', Ventas: 27800, Comisión: 4170 },
  { name: 'Hace 3d', Ventas: 18900, Comisión: 2835 },
  { name: 'Hace 2d', Ventas: 23900, Comisión: 3585 },
  { name: 'Ayer', Ventas: 34900, Comisión: 5235 },
];

export default function SalesChart() {
  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Ventas vs Comisión (Últimos 7 días)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(value/1000)}k`} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} />
          <Legend />
          <Line type="monotone" dataKey="Ventas" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Comisión" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}