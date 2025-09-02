
import React, { useState, useEffect } from 'react';
import { SupportTicket } from "@/api/entities";
import { TicketResponse } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  Phone, 
  User as UserIcon,
  Calendar,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from "sonner";
import { SendEmail } from "@/api/integrations";
import BackButton from "@/components/ui/BackButton";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    initializeAdmin();
    loadTickets();
  }, []);

  const initializeAdmin = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading admin user:", error);
      setError("No tienes permisos de administrador");
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar tickets con manejo robusto de errores
      const allTickets = await SupportTicket.list('-created_date');
      setTickets(allTickets || []);
      
    } catch (error) {
      console.error("Error loading tickets:", error);
      setError("Error al cargar los tickets. Por favor, intenta nuevamente.");
      setTickets([]); // Asegurar que tickets sea un array
    } finally {
      setLoading(false);
    }
  };

  const loadTicketResponses = async (ticketId) => {
    try {
      const ticketResponses = await TicketResponse.filter({ ticket_id: ticketId }, '-created_date');
      setResponses(ticketResponses || []);
    } catch (error) {
      console.error("Error loading ticket responses:", error);
      setResponses([]);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await SupportTicket.update(ticketId, { 
        status: newStatus,
        assigned_to: currentUser?.id 
      });
      
      toast.success(`Ticket actualizado a: ${newStatus}`);
      loadTickets(); // Recargar lista
      
      // Actualizar ticket seleccionado si corresponde
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
      
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error("Error al actualizar el ticket");
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      // Crear respuesta en la base de datos
      await TicketResponse.create({
        ticket_id: selectedTicket.id,
        direction: 'out',
        from_email: 'soporte@arriendospuertovaras.cl',
        to_email: selectedTicket.email,
        subject: `Re: ${selectedTicket.subject}`,
        body: replyText,
        author: currentUser?.full_name || 'Administrador'
      });

      // Intentar enviar email
      try {
        await SendEmail({
          to: selectedTicket.email,
          subject: `Re: ${selectedTicket.subject}`,
          body: `Hola ${selectedTicket.name},\n\n${replyText}\n\nSaludos,\nEquipo de Arriendos Puerto Varas`
        });
        
        toast.success("Respuesta enviada por email exitosamente");
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        toast.warning("Respuesta guardada, pero no se pudo enviar el email");
      }

      // Actualizar estado del ticket
      await updateTicketStatus(selectedTicket.id, 'respondido');
      
      setReplyText('');
      loadTicketResponses(selectedTicket.id);
      
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Error al enviar la respuesta");
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'nuevo': return 'bg-red-100 text-red-800';
      case 'en_proceso': return 'bg-yellow-100 text-yellow-800';
      case 'respondido': return 'bg-blue-100 text-blue-800';
      case 'cerrado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'nuevo': return <AlertTriangle className="w-4 h-4" />;
      case 'en_proceso': return <Clock className="w-4 h-4" />;
      case 'respondido': return <Mail className="w-4 h-4" />;
      case 'cerrado': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || ticket.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={loadTickets} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Tickets de Soporte</h1>
        </div>
        <div className="flex gap-4">
          <Button onClick={loadTickets} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="nuevo">Nuevo</SelectItem>
            <SelectItem value="en_proceso">En Proceso</SelectItem>
            <SelectItem value="respondido">Respondido</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="contacto">Consulta General</SelectItem>
            <SelectItem value="publicar_propiedad">Publicar Propiedad</SelectItem>
            <SelectItem value="publicar_servicio">Publicar Servicio</SelectItem>
            <SelectItem value="opiniones">Opiniones</SelectItem>
            <SelectItem value="empleo">Empleo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Tickets */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay tickets que mostrar</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {ticket.category?.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1">{ticket.subject}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        {ticket.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {ticket.email}
                      </div>
                      {ticket.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {ticket.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ticket.created_date).toLocaleDateString('es-CL')}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">{ticket.message}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Select 
                      value={ticket.status} 
                      onValueChange={(newStatus) => updateTicketStatus(ticket.id, newStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuevo">Nuevo</SelectItem>
                        <SelectItem value="en_proceso">En Proceso</SelectItem>
                        <SelectItem value="respondido">Respondido</SelectItem>
                        <SelectItem value="cerrado">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setSelectedTicket(ticket);
                          loadTicketResponses(ticket.id);
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          {selectedTicket?.subject}
                        </DialogTitle>
                      </DialogHeader>
                      
                      {selectedTicket && (
                        <div className="space-y-6">
                          {/* Información del Ticket */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <strong>De:</strong> {selectedTicket.name} ({selectedTicket.email})
                              </div>
                              <div>
                                <strong>Fecha:</strong> {new Date(selectedTicket.created_date).toLocaleString('es-CL')}
                              </div>
                              <div>
                                <strong>Categoría:</strong> {selectedTicket.category}
                              </div>
                              <div>
                                <strong>Estado:</strong> 
                                <Badge className={`ml-2 ${getStatusColor(selectedTicket.status)}`}>
                                  {selectedTicket.status}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <strong>Mensaje Original:</strong>
                              <p className="mt-2 bg-white p-3 rounded border">{selectedTicket.message}</p>
                            </div>
                          </div>

                          {/* Historial de Respuestas */}
                          {responses.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3">Historial de Respuestas</h4>
                              <div className="space-y-3">
                                {responses.map((response) => (
                                  <div key={response.id} className={`p-3 rounded-lg ${
                                    response.direction === 'out' 
                                      ? 'bg-blue-50 ml-4' 
                                      : 'bg-gray-50 mr-4'
                                  }`}>
                                    <div className="flex justify-between items-center mb-2">
                                      <strong>
                                        {response.direction === 'out' ? response.author : selectedTicket.name}
                                      </strong>
                                      <span className="text-sm text-gray-500">
                                        {new Date(response.created_date).toLocaleString('es-CL')}
                                      </span>
                                    </div>
                                    <p className="whitespace-pre-wrap">{response.body}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Formulario de Respuesta */}
                          <div>
                            <h4 className="font-semibold mb-3">Enviar Respuesta</h4>
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Escribe tu respuesta aquí..."
                              className="mb-3"
                              rows={4}
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                onClick={sendReply}
                                disabled={!replyText.trim() || sendingReply}
                              >
                                {sendingReply ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <Send className="w-4 h-4 mr-2" />
                                )}
                                {sendingReply ? 'Enviando...' : 'Enviar Respuesta'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
