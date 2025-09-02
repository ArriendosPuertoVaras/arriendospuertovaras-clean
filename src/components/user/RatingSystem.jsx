import React, { useState, useEffect } from "react";
import { Rating } from "@/api/entities";
import { User } from "@/api/entities";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function RatingSystem({ 
  targetUserId, 
  bookingId, 
  serviceReservationId, 
  canRate = false, 
  showRatings = true 
}) {
  const [ratings, setRatings] = useState([]);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState({
    rating: 5,
    comment: "",
    criteria: {
      communication: 5,
      punctuality: 5,
      quality: 5,
      professionalism: 5
    }
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadRatings();
    loadCurrentUser();
  }, [targetUserId]);

  const loadCurrentUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const loadRatings = async () => {
    try {
      const userRatings = await Rating.filter({ 
        rated_user_id: targetUserId, 
        status: "published" 
      }, "-created_date", 10);
      setRatings(userRatings);
    } catch (error) {
      console.error("Error loading ratings:", error);
    }
  };

  const submitRating = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para calificar");
      return;
    }

    setLoading(true);
    try {
      await Rating.create({
        rater_id: user.id,
        rated_user_id: targetUserId,
        booking_id: bookingId,
        service_reservation_id: serviceReservationId,
        rating: newRating.rating,
        comment: newRating.comment,
        criteria: newRating.criteria,
        category: bookingId ? "host" : "service_provider"
      });

      toast.success("Calificación enviada exitosamente");
      setShowRatingForm(false);
      loadRatings();
      
      // Reset form
      setNewRating({
        rating: 5,
        comment: "",
        criteria: {
          communication: 5,
          punctuality: 5,
          quality: 5,
          professionalism: 5
        }
      });
    } catch (error) {
      toast.error("Error al enviar la calificación");
    }
    setLoading(false);
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 cursor-pointer ${
          i < rating ? 'text-amber-400 fill-current' : 'text-gray-300'
        }`}
        onClick={() => interactive && onChange && onChange(i + 1)}
      />
    ));
  };

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {showRatings && ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-400 fill-current" />
                <span>{calculateAverageRating()} ({ratings.length} reseñas)</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Criteria Breakdown */}
            {ratings.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {['communication', 'punctuality', 'quality', 'professionalism'].map(criteria => {
                  const avg = ratings.reduce((sum, r) => sum + (r.criteria?.[criteria] || r.rating), 0) / ratings.length;
                  return (
                    <div key={criteria} className="text-center">
                      <div className="font-medium capitalize">{criteria.replace('_', ' ')}</div>
                      <div className="flex justify-center mt-1">
                        {renderStars(Math.round(avg))}
                      </div>
                      <div className="text-sm text-gray-500">{avg.toFixed(1)}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Individual Ratings */}
            <div className="space-y-4">
              {ratings.slice(0, 3).map((rating) => (
                <div key={rating.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {renderStars(rating.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(rating.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{rating.helpful_votes}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{rating.comment}</p>
                  {rating.response_from_rated && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm"><strong>Respuesta:</strong> {rating.response_from_rated}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {ratings.length > 3 && (
              <Button variant="outline" className="w-full mt-4">
                Ver todas las reseñas ({ratings.length})
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rating Form */}
      {canRate && (
        <Card>
          <CardHeader>
            <CardTitle>Calificar este servicio</CardTitle>
          </CardHeader>
          <CardContent>
            {!showRatingForm ? (
              <Button onClick={() => setShowRatingForm(true)} className="w-full">
                Escribir una reseña
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Calificación general</label>
                  <div className="flex items-center space-x-2">
                    {renderStars(newRating.rating, true, (rating) => 
                      setNewRating(prev => ({ ...prev, rating }))
                    )}
                  </div>
                </div>

                {/* Criteria Rating */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(newRating.criteria).map(([criteria, value]) => (
                    <div key={criteria}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {criteria.replace('_', ' ')}
                      </label>
                      <div className="flex items-center space-x-1">
                        {renderStars(value, true, (rating) => 
                          setNewRating(prev => ({
                            ...prev,
                            criteria: { ...prev.criteria, [criteria]: rating }
                          }))
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Comentario</label>
                  <Textarea
                    value={newRating.comment}
                    onChange={(e) => setNewRating(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Comparte tu experiencia..."
                    rows={4}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={submitRating} 
                    disabled={loading || !newRating.comment.trim()}
                    className="flex-1"
                  >
                    {loading ? "Enviando..." : "Enviar reseña"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRatingForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}