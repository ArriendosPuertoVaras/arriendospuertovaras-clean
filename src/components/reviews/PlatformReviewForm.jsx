import React, { useState } from 'react';
import { PlatformReview } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function PlatformReviewForm({ reviewerType, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    User.me().then(user => {
      if (user) {
        setReviewerName(user.full_name || '');
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Por favor, selecciona una calificación.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Por favor, escribe un comentario.');
      return;
    }
    setLoading(true);
    try {
      await PlatformReview.create({
        reviewer_type: reviewerType,
        reviewer_name: reviewerName,
        business_name: businessName,
        rating,
        comment,
        status: 'pendiente'
      });
      if (onSubmitted) {
        onSubmitted();
      }
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error('Hubo un error al enviar tu opinión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Tu Calificación</Label>
        <div className="flex items-center space-x-1 mt-2">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <button
                key={ratingValue}
                type="button"
                onClick={() => setRating(ratingValue)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    ratingValue <= rating ? 'text-amber-400 fill-current' : 'text-slate-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label htmlFor="reviewerName">Tu Nombre</Label>
        <Input
          id="reviewerName"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          required
        />
      </div>
      {reviewerType === 'operador' && (
        <div>
          <Label htmlFor="businessName">Nombre de tu Negocio (Opcional)</Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
      )}
      <div>
        <Label htmlFor="comment">Tu Opinión</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="Describe tu experiencia con la plataforma..."
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando...' : 'Enviar Opinión'}
      </Button>
    </form>
  );
}