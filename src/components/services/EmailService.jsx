import { SendEmail } from "@/api/integrations";
import { EmailLog } from "@/api/entities";
import { EmailTemplate } from "@/api/entities";
import { trackEvent } from '@/components/utils/EventTracker';
import { toast } from "sonner";

const fromEmailMap = {
  contacto: { from: "hola@arriendospuertovaras.cl", name: "Contacto - Arriendos Puerto Varas" },
  publicar_propiedad: { from: "reservas@arriendospuertovaras.cl", name: "Publicaciones - Arriendos Puerto Varas" },
  publicar_servicio: { from: "reservas@arriendospuertovaras.cl", name: "Publicaciones - Arriendos Puerto Varas" },
  opiniones: { from: "soporte@arriendospuertovaras.cl", name: "Soporte - Arriendos Puerto Varas" },
  soporte: { from: "soporte@arriendospuertovaras.cl", name: "Soporte - Arriendos Puerto Varas" },
  empleo: { from: "empleo@arriendospuertovaras.cl", name: "Empleo - Arriendos Puerto Varas" },
  default: { from: "hola@arriendospuertovaras.cl", name: "Arriendos Puerto Varas" }
};

// Plantillas por defecto (fallback si no hay en BD)
const defaultTemplates = {
  contacto: {
    subject: "Hemos recibido tu consulta [APV-{id}]",
    body: "Hola {nombre},\n\nGracias por escribirnos. Tu consulta (ID {id}) con asunto \"{asunto}\" fue recibida. Te responderemos dentro de {sla}.\n\n— Arriendos Puerto Varas",
    sla: 24
  },
  publicar_propiedad: {
    subject: "Solicitud recibida — Publicación [APV-{id}]",
    body: "Hola {nombre},\n\nRecibimos tu solicitud para publicar (ID {id}). Un miembro del equipo la revisará y te contactará.\n\n— Equipo de Publicaciones",
    sla: 48
  },
  publicar_servicio: {
    subject: "Solicitud recibida — Publicación [APV-{id}]",
    body: "Hola {nombre},\n\nRecibimos tu solicitud para publicar (ID {id}). Un miembro del equipo la revisará y te contactará.\n\n— Equipo de Publicaciones",
    sla: 48
  },
  opiniones: {
    subject: "Gracias por tu opinión — En revisión [APV-{id}]",
    body: "Hola {nombre},\n\n¡Gracias por tu opinión! La revisaremos y te avisaremos cuando sea publicada. Ref: {id}.\n\n— Soporte Operadores",
    sla: 72
  },
  empleo: {
    subject: "Postulación recibida [APV-{id}]",
    body: "Hola {nombre},\n\nRecibimos tu postulación \"{asunto}\". Si avanzas, te contactaremos por este medio.\n\n— RR.HH.",
    sla: 120
  }
};

/**
 * Servicio centralizado para enviar correos electrónicos.
 */
const EmailService = {
  /**
   * Envía un correo electrónico y registra el intento.
   * @param {string} category - La categoría para determinar el remitente.
   * @param {string} to - Email del destinatario.
   * @param {string} subject - Asunto del email.
   * @param {string} htmlBody - Contenido del email en HTML.
   * @param {string} [replyTo] - Email para 'Reply-To' (opcional).
   * @returns {Promise<boolean>} - True si tuvo éxito, false si falló.
   */
  async send(category, to, subject, htmlBody, replyTo) {
    const sender = fromEmailMap[category] || fromEmailMap.default;

    const logPayload = {
      provider: 'titan',
      from_email: sender.from,
      to_email: to,
      subject: subject,
      status: 'fail',
    };

    try {
      await SendEmail({
        to: to,
        subject: subject,
        body: htmlBody,
        from_name: sender.name,
      });

      logPayload.status = 'success';
      await EmailLog.create(logPayload);
      
      // Track success event
      trackEvent('email_send_success', { category: category, to: to, subject: subject });

      return true;

    } catch (error) {
      console.error("EmailService Error:", error);
      
      logPayload.error = error.message || JSON.stringify(error);
      await EmailLog.create(logPayload);
      
      // Track fail event
      trackEvent('email_send_fail', { category: category, to: to, subject: subject, error: error.message });
      
      return false;
    }
  },

  /**
   * Genera ID único en formato APV-{ID}
   * @param {string} ticketId - ID del ticket
   * @returns {string} - ID formateado
   */
  generateDisplayId(ticketId) {
    return `APV-${ticketId.slice(-6).toUpperCase()}`;
  },

  /**
   * Procesa variables en plantillas
   * @param {string} template - Plantilla con variables
   * @param {object} variables - Variables a reemplazar
   * @returns {string} - Texto procesado
   */
  processTemplate(template, variables) {
    let processed = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processed = processed.replace(regex, value);
    }
    return processed;
  },

  /**
   * Obtiene plantilla desde BD o usa fallback
   * @param {string} category - Categoría del template
   * @returns {object} - Template data
   */
  async getTemplate(category) {
    try {
      const templateKey = `${category}_ack`;
      const templates = await EmailTemplate.filter({ template_key: templateKey, active: true });
      
      if (templates.length > 0) {
        const template = templates[0];
        return {
          subject: template.subject_template,
          body: template.body_template,
          sla: template.sla_hours || 24
        };
      }
    } catch (error) {
      console.warn("Error loading template from DB, using default:", error);
    }

    // Fallback to default template
    return defaultTemplates[category] || defaultTemplates.contacto;
  },

  /**
   * Envía un correo de acuse de recibo usando plantillas.
   * @param {string} category - La categoría de la consulta.
   * @param {string} to - Email del destinatario.
   * @param {object} variables - Variables para la plantilla.
   * @param {string} ticketId - ID del ticket creado.
   */
  async sendAck(category, to, variables, ticketId) {
    try {
      const template = await this.getTemplate(category);
      const displayId = this.generateDisplayId(ticketId);
      
      // Variables disponibles para las plantillas
      const templateVars = {
        nombre: variables.name || 'Usuario',
        asunto: variables.subject || 'Consulta',
        id: displayId,
        sla: `${template.sla} horas`
      };

      const subject = this.processTemplate(template.subject, templateVars);
      const body = this.processTemplate(template.body, templateVars);
      
      // Convertir texto plano a HTML básico
      const htmlBody = body.replace(/\n/g, '<br>');
      
      return await this.send(category, to, subject, htmlBody);
      
    } catch (error) {
      console.error("Error sending ACK email:", error);
      return false;
    }
  }
};

export default EmailService;