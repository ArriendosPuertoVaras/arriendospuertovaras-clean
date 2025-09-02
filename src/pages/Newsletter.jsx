import React, { useState, useEffect } from 'react';
import { NewsletterSubscription } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { setDefaultMeta } from '@/components/utils/seo';

export default function NewsletterPage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setDefaultMeta('newsletter', {
            title: 'Suscríbete a nuestro boletín | Arriendos Puerto Varas',
            description: 'Recibe las mejores ofertas, propiedades nuevas y guías exclusivas de Puerto Varas directamente en tu correo.'
        });
    }, []);

    const handleInterestChange = (interest) => {
        setInterests(prev => 
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Por favor, ingresa tu correo electrónico.');
            return;
        }
        setLoading(true);
        try {
            await NewsletterSubscription.create({
                email,
                full_name: name,
                interests,
                source: 'newsletter_page'
            });
            toast.success('¡Gracias por suscribirte!', {
                description: 'Te hemos agregado a nuestra lista. Pronto recibirás noticias nuestras.',
            });
            setEmail('');
            setName('');
            setInterests([]);
        } catch (error) {
            console.error("Subscription error:", error);
            if (error.message.includes('unique constraint')) {
                toast.info('Este correo ya está suscrito.', {
                    description: 'Gracias por tu interés. Ya estás en nuestra lista.',
                });
            } else {
                toast.error('Hubo un error al suscribirte. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const interestOptions = [
        { id: 'propiedades_destacadas', label: 'Propiedades Destacadas' },
        { id: 'servicios_nuevos', label: 'Nuevos Servicios' },
        { id: 'eventos_locales', label: 'Eventos Locales' },
        { id: 'guias_turismo', label: 'Guías de Turismo' },
        { id: 'promociones', label: 'Promociones y Ofertas' },
        { id: 'consejos_anfitriones', label: 'Consejos para Anfitriones' },
    ];

    return (
        <div className="bg-manto min-h-screen py-16">
            <div className="max-w-2xl mx-auto px-4">
                <div className="neuro-card-outset p-8 md:p-12 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">
                        Únete a nuestra comunidad
                    </h1>
                    <p className="text-slate-600 mb-8">
                        Recibe las mejores ofertas, propiedades nuevas y guías exclusivas de Puerto Varas directamente en tu correo. Sin spam, solo contenido de calidad.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nombre (Opcional)</label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre completo"
                                className="neuro-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico *</label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                className="neuro-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tus intereses</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {interestOptions.map(option => (
                                    <div key={option.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={option.id}
                                            checked={interests.includes(option.id)}
                                            onCheckedChange={() => handleInterestChange(option.id)}
                                        />
                                        <label htmlFor={option.id} className="text-sm text-slate-600 cursor-pointer">
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" className="w-full neuro-button neuro-button-primary" disabled={loading}>
                            {loading ? 'Suscribiendo...' : 'Suscribirme'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}