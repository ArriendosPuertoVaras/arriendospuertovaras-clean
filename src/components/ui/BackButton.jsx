import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ className = "", ...props }) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Button
      onClick={handleBack}
      className={`neuro-button ${className}`}
      {...props}
    >
      <ArrowLeft className="w-5 h-5" />
    </Button>
  );
}