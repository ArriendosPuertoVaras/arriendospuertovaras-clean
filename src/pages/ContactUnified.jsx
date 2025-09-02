
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SupportTicket } from '@/api/entities';
import emailService from '@/components/services/EmailService'; // Updated import path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, MessageSquare, Building, Users, Shield } from 'lucide-react';
import { setPageMeta, generateStructuredData, insertStructuredData } from "@/components/utils/seo";
import { checkRateLimit } from '@/components/utils/securityUtils';
import { trackEvent } from '@/components/utils/EventTracker';

export default function ContactUnifiedPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
    consent: false,
  });
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);

  const categoryOptions = [
    { value: 'contacto', label: 'Consulta general', description: 'Preguntas generales sobre la plataforma' },
    { value: 'publicar_propiedad', label: 'Publicar propiedad', description: 'Quiero publicar mi propiedad' },
    { value: 'publicar_servicio', label: 'Publicar servicio', description: 'Quiero ofrecer un servicio' },
    { value: 'opiniones', label: 'Opiniones de usuarios / operadores', description: 'Comentarios sobre usuarios o operadores' },
    { value: 'empleo', label: 'Trabaja con nosotros', description: 'Oportunidades laborales' }
  ];

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConsentChange = (checked) => {
    setFormData(prev => ({ ...prev, consent: checked }));
  };

  const validateForm = () => {
    // Rate limiting (5 envíos por 10 minutos) - Client-side basic check
    if (submissionCount >= 5) {
      toast.error('Has alcanzado el límite de envíos. Intenta en 10 minutos.');
      return false;
    }

    if (!formData.name.trim() || formData.name.length < 2 || formData.name.length > 80) {
      toast.error('Por favor, ingresa un nombre válido (2-80 caracteres).');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Por favor, ingresa un email válido.');
      return false;
    }
    if (formData.phone && (formData.phone.length > 20 || !/^[0-9+\-() ]*$/.test(formData.phone))) {
        toast.error('Por favor, ingresa un número de teléfono válido.');
        return false;
    }
    if (!formData.category) {
      toast.error('Por favor, selecciona una categoría.');
      return false;
    }
    if (!formData.subject.trim()) {
      toast.error('Por favor, ingresa un asunto.');
      return false;
    }
    if (!formData.message.trim() || formData.message.length < 20 || formData.message.length > 1500) {
      toast.error('El mensaje debe tener entre 20 y 1500 caracteres.');
      return false;
    }
    if (!formData.consent) {
      toast.error('Debes aceptar la Política de Privacidad.');
      return false;
    }
    return true;
  };

  const generateTicketId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `APV-${timestamp}${random}`;
  };

  const createMessageHash = (message) => {
    // Simple hash for audit purposes
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) {
      console.log("Bot detected!");
      return; 
    }

    // -- INICIO: RATE LIMITING (from securityUtils) --
    const isAllowed = checkRateLimit('contact-form-submit');
    if (!isAllowed) {
      toast.error("Has enviado demasiados formularios. Por favor, espera un momento.");
      return;
    }
    // -- FIN: RATE LIMITING --
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSubmissionCount(prev => prev + 1); // Increment for the existing client-side rate limit check

    const ticketId = generateTicketId();
    const messageHash = createMessageHash(formData.message);

    try {
      // 1. Crear ticket en base de datos
      const ticketData = {
        ticket_id: ticketId,
        category: formData.category,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        metadata: {
          ip: 'hidden', // En producción obtener IP real
          user_agent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        },
        message_hash: messageHash,
        last_activity: new Date().toISOString()
      };

      const ticket = await SupportTicket.create(ticketData);

      // 2. Enviar confirmación automática (ACK)
      try {
        const categoryConfig = categoryOptions.find(opt => opt.value === formData.category);
        const ackVariables = {
          ID: ticketId,
          nombre: formData.name,
          asunto: formData.subject,
          categoria: categoryConfig?.label || formData.category,
          SLA: emailService.categories[formData.category]?.sla || '48 horas hábiles'
        };

        const ackResult = await emailService.sendAck(formData.category, formData.email, ackVariables);
        
        // Actualizar ticket con info del ACK
        await SupportTicket.update(ticket.id, {
          ack_sent: true,
          ack_sent_at: new Date().toISOString(),
          ack_email_log_id: ackResult.messageId
        });

        toast.success(`Gracias, ${formData.name}. Tu consulta fue registrada con ID: ${ticketId}. Revisa tu email para la confirmación.`);

      } catch (ackError) {
        console.error('ACK sending failed:', ackError);
        toast.success(`Tu consulta fue registrada con ID: ${ticketId}. Te contactaremos pronto.`);
      }

      // Track successful submission
      trackEvent('ContactForm', 'SubmitSuccess', formData.category);

      // Reset form
      setFormData({ 
        name: '', email: '', phone: '', subject: '', category: '', message: '', consent: false 
      });
      
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      toast.error('No pudimos procesar tu consulta. Inténtalo nuevamente en unos minutos.');
      // Track failed submission
      trackEvent('ContactForm', 'SubmitFailure', formData.category, error.message);
    }
    
    setLoading(false);
  };

  const selectedCategory = categoryOptions.find(opt => opt.value === formData.category);

  return (
    <div className="bg-slate-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          
          {/* Contact Info Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Contáctanos
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                ¿Tienes alguna pregunta, sugerencia o quieres formar parte de nuestra comunidad? 
                Estamos aquí para ayudarte.
              </p>
            </div>

            <div className="grid gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Email principal</h3>
                      <p className="text-slate-600">hola@arriendospuertovaras.cl</p>
                      <p className="text-sm text-slate-500 mt-1">Respuesta en 24 horas hábiles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Building className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Para anfitriones</h3>
                      <p className="text-slate-600">reservas@arriendospuertovaras.cl</p>
                      <p className="text-sm text-slate-500 mt-1">Publicación de propiedades y servicios</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Users className="w-6 h-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Recursos Humanos</h3>
                      <p className="text-slate-600">empleo@arriendospuertovaras.cl</p>
                      <p className="text-sm text-slate-500 mt-1">Oportunidades laborales y colaboraciones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Form Section */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Envíanos tu consulta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nombre y apellido *</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                    minLength="2" 
                    maxLength="80" 
                    placeholder="Ej: Juan Pérez" 
                  />
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="tu@email.com" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono (Opcional)</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        maxLength="20" 
                        placeholder="+56 9 1234 5678" 
                      />
                    </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select onValueChange={(value) => handleSelectChange('category', value)} value={formData.category}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-slate-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <p className="text-xs text-slate-500 mt-1">
                      Se enviará desde: {emailService.categories[selectedCategory.value]?.from}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="subject">Asunto *</Label>
                  <Input 
                    id="subject" 
                    type="text" 
                    value={formData.subject} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Breve descripción de tu consulta" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea 
                    id="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    required 
                    minLength="20" 
                    maxLength="1500" 
                    placeholder="Escribe tu mensaje aquí... (mínimo 20 caracteres)" 
                    className="h-32" 
                  />
                  <div className="text-sm text-slate-500 mt-1">
                    {formData.message.length}/1500 caracteres
                  </div>
                </div>

                {/* Honeypot field */}
                <input
                  type="text"
                  name="honeypot"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={handleConsentChange}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <Label htmlFor="consent" className="cursor-pointer">
                      Acepto la{' '}
                      <Link 
                        to={createPageUrl('PrivacyPolicy')} 
                        className="text-blue-600 hover:text-blue-800 underline"
                        target="_blank"
                      >
                        Política de Privacidad
                      </Link>
                      {' '}y el uso de mis datos para responder esta consulta.
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !formData.consent} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando consulta...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Enviar Consulta
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span>Tus datos están protegidos. Respuesta garantizada en 24-48 horas hábiles.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
