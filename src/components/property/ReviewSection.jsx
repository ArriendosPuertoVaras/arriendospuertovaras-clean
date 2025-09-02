import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function ReviewSection({ reviews, property }) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reseñas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Esta propiedad aún no tiene reseñas.</p>
        </CardContent>
      </Card>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-current' : 'text-slate-300'}`} 
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-amber-400 fill-current" />
            <span>{averageRating.toFixed(1)} · {reviews.length} reseñas</span>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rating Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold">Limpieza</div>
            <div className="flex items-center justify-center space-x-1 mt-1">
              {renderStars(Math.round(reviews.reduce((sum, r) => sum + (r.cleanliness_rating || r.rating), 0) / reviews.length))}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Comunicación</div>
            <div className="flex items-center justify-center space-x-1 mt-1">
              {renderStars(Math.round(reviews.reduce((sum, r) => sum + (r.communication_rating || r.rating), 0) / reviews.length))}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Ubicación</div>
            <div className="flex items-center justify-center space-x-1 mt-1">
              {renderStars(Math.round(reviews.reduce((sum, r) => sum + (r.location_rating || r.rating), 0) / reviews.length))}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Relación calidad-precio</div>
            <div className="flex items-center justify-center space-x-1 mt-1">
              {renderStars(Math.round(reviews.reduce((sum, r) => sum + (r.value_rating || r.rating), 0) / reviews.length))}
            </div>
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-6">
          {reviews.slice(0, 6).map((review) => (
            <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-slate-100 text-slate-600">
                    U
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium">Usuario</span>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-slate-500">
                      {format(new Date(review.created_date), "MMMM yyyy", { locale: es })}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reviews.length > 6 && (
          <div className="text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Mostrar todas las reseñas ({reviews.length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}