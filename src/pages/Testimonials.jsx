import React, { useState, useEffect } from 'react';
import { PlatformReview } from '@/api/entities';
import { User } from '@/api/entities';
import PlatformReviewForm from '@/components/reviews/PlatformReviewForm';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const StarRating = ({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-current' : 'text-slate-300'}`}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <Card className="flex flex-col h-full">
    <CardContent className="p-6 flex-grow flex flex-col">
      <div className="flex items-start space-x-4 mb-4">
        <Avatar>
          <AvatarImage src={review.profile_image_url} alt={review.reviewer_name} />
          <AvatarFallback>{review.reviewer_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-slate-800">{review.reviewer_name}</p>
          {review.business_name && (
            <p className="text-sm text-slate-500">{review.business_name}</p>
          )}
        </div>
      </div>
      <StarRating rating={review.rating} />
      <p className="text-slate-600 mt-3 text-base flex-grow">"{review.comment}"</p>
    </CardContent>
  </Card>
);

export default function TestimonialsPage() {
  const [operatorReviews, setOperatorReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [approvedOperatorReviews, approvedUserReviews, userData] = await Promise.all([
        PlatformReview.filter({ status: 'publicada', reviewer_type: 'operador' }),
        PlatformReview.filter({ status: 'publicada', reviewer_type: 'cliente' }),
        User.me().catch(() => null) // Fetch user, but don't fail if not logged in
      ]);
      setOperatorReviews(approvedOperatorReviews);
      setUserReviews(approvedUserReviews);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenForm = (e) => {
    if (!currentUser) {
      e.preventDefault();
      toast.info("Debes iniciar sesión para dejar una opinión.");
      User.loginWithRedirect(window.location.href);
    } else {
      setFormOpen(true);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getReviewerType = () => {
    if (!currentUser) return 'cliente';
    return currentUser.user_type === 'arrendador' ? 'operador' : 'cliente';
  };

  return (
    <div className="bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Lo que dicen de nosotros
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Opiniones reales de usuarios y operadores que confían en nuestra plataforma.
          </p>
        </div>
        
        <div className="text-center mb-16">
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenForm}>Quiero dejar mi opinión</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Comparte tu experiencia</DialogTitle>
                </DialogHeader>
                <PlatformReviewForm 
                  reviewerType={getReviewerType()} 
                  onSubmitted={() => {
                    setFormOpen(false);
                    loadData(); // Reload reviews after submission
                    toast.success("¡Gracias! Tu opinión se ha enviado y será revisada.");
                  }} 
                />
              </DialogContent>
            </Dialog>
        </div>

        {/* Opiniones de Operadores */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center md:text-left">Opiniones de Operadores</h2>
          {operatorReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {operatorReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <Card className="text-center p-12">
              <MessageSquareQuote className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-800">Aún no hay opiniones de operadores.</h3>
              <p className="mt-1 text-sm text-slate-500">
                ¡Sé el primero en compartir tu experiencia con la comunidad!
              </p>
            </Card>
          )}
        </section>

        {/* Opiniones de Usuarios */}
        <section>
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center md:text-left">Opiniones de Clientes</h2>
          {userReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
             <Card className="text-center p-12 bg-slate-100 border-dashed">
                <MessageSquareQuote className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium text-slate-800">Aún no hay opiniones de clientes.</h3>
                <p className="mt-1 text-sm text-slate-500">
                  ¡Vuelve pronto para ver lo que dicen nuestros viajeros!
                </p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}