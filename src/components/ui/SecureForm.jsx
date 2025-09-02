import React from 'react';
import { Input } from '@/components/ui/input';

/**
 * Componente de formulario con medidas de seguridad integradas
 * Incluye honeypot automáticamente
 */
export default function SecureForm({ children, onSubmit, ...props }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Pasar datos incluyendo honeypot al handler padre
    onSubmit(e, data);
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      {/* Honeypot field - invisible to users, should remain empty */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }}>
        <label htmlFor="website">
          Si eres humano, deja este campo vacío:
        </label>
        <Input
          id="website"
          name="website"
          type="text"
          tabIndex="-1"
          autoComplete="off"
        />
      </div>
      
      {children}
    </form>
  );
}