
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BackButton from '@/components/ui/BackButton';

export default function AdminKnowledgeBasePage() {

    // The base44 dashboard URL structure for data management.
    const knowledgeItemDataUrl = "/dashboard/data/knowledgeitem";

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        <span>Gestionar Base de Conocimiento de Jaime</span>
                    </h1>
                    <p className="text-slate-600">Actualiza la información que utiliza el asistente de IA para dar recomendaciones.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Actualizar Contenido Dinámico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-slate-700">
                        Para añadir, editar o eliminar recomendaciones de restaurantes, eventos, servicios o consejos para viajeros, debes gestionar los registros en la entidad <strong>KnowledgeItem</strong>.
                    </p>
                    <p>
                        Jaime utilizará esta información en tiempo real para ofrecer las recomendaciones más actualizadas a los usuarios.
                    </p>
                    
                    <a href={knowledgeItemDataUrl} target="_blank" rel="noopener noreferrer">
                        <Button>
                            Gestionar Items de Conocimiento
                        </Button>
                    </a>

                    <Alert className="mt-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>¿Cómo funciona?</AlertTitle>
                        <AlertDescription>
                            El panel de "Data" en tu dashboard de Base44 te permite administrar directamente la base de datos de tu aplicación. Al hacer clic en el botón, serás llevado a la tabla 'KnowledgeItem' donde puedes manejar las recomendaciones de Jaime como si fuera una hoja de cálculo.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Contenido Estático</CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-slate-700">
                        La información sobre el funcionamiento de la plataforma (comisiones, cómo publicar, etc.) y la guía turística general está integrada directamente en el código. Para cambios en esta información, por favor solicítalos a través del chat de desarrollo.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
