
import React, { useState, useEffect } from 'react';
import { PlatformReview } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Check, X, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import BackButton from "@/components/ui/BackButton";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendiente');

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      let filters = {};
      if (filter !== 'all') {
        filters.status = filter;
      }
      const fetchedReviews = await PlatformReview.filter(filters, '-created_date');
      setReviews(fetchedReviews || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("No se pudieron cargar las opiniones.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      await PlatformReview.update(reviewId, { status: newStatus });
      toast.success(`Opinión ${newStatus === 'publicada' ? 'aprobada' : 'rechazada'} correctamente.`);
      loadReviews(); // Recargar la lista
    } catch (error) {
      console.error("Error updating review status:", error);
      toast.error("Error al actualizar la opinión.");
    }
  };

  const StarRating = ({ rating }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-current' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const config = {
      pendiente: { label: 'Pendiente', variant: 'secondary' },
      publicada: { label: 'Publicada', variant: 'default', className: 'bg-green-100 text-green-800' },
      rechazada: { label: 'Rechazada', variant: 'destructive' },
    };
    const current = config[status] || config.pendiente;
    return <Badge variant={current.variant} className={current.className}>{current.label}</Badge>;
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Moderar Opiniones</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pendiente">Pendientes</SelectItem>
              <SelectItem value="publicada">Publicadas</SelectItem>
              <SelectItem value="rechazada">Rechazadas</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadReviews} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No hay opiniones que mostrar
          </h3>
          <p className="text-slate-600">
            No se encontraron opiniones con el filtro seleccionado.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{review.reviewer_name}</CardTitle>
                    <p className="text-sm text-slate-500">
                      Tipo: {review.reviewer_type} | Enviado: {format(new Date(review.created_date), "d MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StarRating rating={review.rating} />
                    <StatusBadge status={review.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 italic">"{review.comment}"</p>
              </CardContent>
              {review.status === 'pendiente' && (
                <CardFooter className="flex justify-end space-x-3">
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus(review.id, 'rechazada')}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus(review.id, 'publicada')}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprobar y Publicar
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
