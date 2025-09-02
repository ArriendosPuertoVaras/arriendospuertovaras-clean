
import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { SupportTicket } from '@/api/entities';
import EmailService from '@/components/services/EmailService';
import { trackEvent } from '@/components/utils/EventTracker';
import { validateFormSecurity, getClientIP, sanitizeText } from '@/components/utils/securityUtils';
import { Mail, Send, Loader2, Shield } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SecureForm from '@/components/ui/SecureForm';
import { toast } from 'sonner';
import { setPageMeta, setDefaultMeta } from '@/components/utils/seo';

export default function ContactPage() {
  const crumbs = [{ label: 'Inicio', href: createPageUrl('Home') }, { label: 'Contacto' }];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'contacto',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [securityError, setSecurityError] = useState('');
  
  useEffect(() => {
    setDefaultMeta('contacto');
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    // Sanitizar input en tiempo real
    const cleanValue = sanitizeText(value);
    setFormData(prev => ({ ...prev, [id]: cleanValue }));
    
    // Limpiar error de seguridad cuando el usuario empieza a escribir
    if (securityError) setSecurityError('');
  };
  
  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e, formDataWithHoneypot) => {
    setLoading(true);
    setSecurityError('');

    try {
      // 1. Validaciones de seguridad
      const clientIP = getClientIP();
      const securityCheck = validateFormSecurity(formDataWithHoneypot, clientIP);
      
      if (!securityCheck.valid) {
        setSecurityError(securityCheck.error);
        trackEvent('form_security_blocked', { // Track security block
          reason: securityCheck.error, 
          form_name: 'contact',
          ip: clientIP,
          category: formData.category 
        });
        return;
      }

      // 2. Crear el ticket con datos sanitizados
      const sanitizedData = {
        ...formData,
        name: sanitizeText(formData.name),
        email: sanitizeText(formData.email),
        phone: sanitizeText(formData.phone),
        subject: sanitizeText(formData.subject),
        message: sanitizeText(formData.message),
        status: 'nuevo',
        origin_url: window.location.href,
        ip_address: clientIP,
        meta: {
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        }
      };

      const ticket = await SupportTicket.create(sanitizedData);
      
      // 3. Track successful form submission in GA4
      trackEvent('submit_form', { 
        form_name: 'contact', 
        form_category: formData.category,
      });

      // 4. Send acknowledgment email with ticket ID
      await EmailService.sendAck(formData.category, formData.email, {
        name: formData.name,
        subject: formData.subject,
      }, ticket.id);
      
      setSubmitted(true);
      toast.success("¡Mensaje enviado! Hemos recibido tu consulta.");

    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Hubo un error al enviar tu mensaje. Inténtalo de nuevo.");
      
      trackEvent('form_submit_error', { // Track submission error
        form_name: 'contact',
        error: error.message,
        category: formData.category 
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Mail className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">¡Gracias por contactarnos!</h1>
        <p className="text-lg text-slate-600">
          Hemos recibido tu mensaje y te hemos enviado un correo de confirmación. Nuestro equipo se pondrá en contacto contigo a la brevedad.
        </p>
        <Button onClick={() => window.location.href = createPageUrl('Home')} className="mt-8">
          Volver al Inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={crumbs} />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Contáctanos</h1>
        <p className="text-xl text-slate-600">
          ¿Tienes alguna consulta? Estamos aquí para ayudarte.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Envíanos un mensaje</span>
            </CardTitle>
            <CardDescription>
              Completa el formulario y te responderemos a la brevedad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {securityError && (
              <Alert variant="destructive" className="mb-6">
                <Shield className="w-4 h-4" />
                <AlertDescription>{securityError}</AlertDescription>
              </Alert>
            )}

            <SecureForm onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    maxLength="100"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    maxLength="255"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength="20"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Tipo de consulta *</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contacto">Consulta general</SelectItem>
                      <SelectItem value="publicar_propiedad">Publicar propiedad</SelectItem>
                      <SelectItem value="publicar_servicio">Publicar servicio</SelectItem>
                      <SelectItem value="opiniones">Opiniones de usuarios / operadores</SelectItem>
                      <SelectItem value="empleo">Trabaja con nosotros</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="category" value={formData.category} />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Asunto *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  maxLength="200"
                />
              </div>

              <div>
                <Label htmlFor="message">Mensaje *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  required
                  maxLength="2000"
                  placeholder="Describe tu consulta con el mayor detalle posible..."
                />
                <div className="text-sm text-slate-500 mt-1">
                  {formData.message.length}/2000 caracteres
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full btn-primary text-lg py-3">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </SecureForm>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Información de contacto</h3>
              <div className="space-y-3">
                <p><strong>Email general:</strong> hola@arriendospuertovaras.cl</p>
                <p><strong>Publicaciones:</strong> reservas@arriendospuertovaras.cl</p>
                <p><strong>Soporte:</strong> soporte@arriendospuertovaras.cl</p>
                <p><strong>Empleo:</strong> empleo@arriendospuertovaras.cl</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tiempo de respuesta</h3>
              <div className="space-y-2">
                <p><strong>Consultas generales:</strong> 24 horas</p>
                <p><strong>Publicaciones:</strong> 48 horas</p>
                <p><strong>Soporte técnico:</strong> 72 horas</p>
                <p><strong>Empleo:</strong> 5 días hábiles</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
