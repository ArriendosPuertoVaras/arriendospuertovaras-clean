import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BackButton from '@/components/ui/BackButton';

export default function CompanyDataPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <BackButton />
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-800">Datos de la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-slate-700">
              <div className="flex flex-col sm:flex-row">
                <strong className="w-full sm:w-1/3 text-slate-600">Razón Social:</strong>
                <p className="flex-1">ARRIENDOS PUERTO VARAS SpA</p>
              </div>
              <div className="flex flex-col sm:flex-row">
                <strong className="w-full sm:w-1/3 text-slate-600">RUT:</strong>
                <p className="flex-1">78.231.215-4</p>
              </div>
              <div className="flex flex-col sm:flex-row">
                <strong className="w-full sm:w-1/3 text-slate-600">Tipo de Sociedad:</strong>
                <p className="flex-1">Sociedad por Acciones (SpA) constituida en Chile</p>
              </div>
              <div className="flex flex-col sm:flex-row">
                <strong className="w-full sm:w-1/3 text-slate-600">Giro Principal:</strong>
                <p className="flex-1">Servicios de arriendos y turismo en la Región de Los Lagos</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-slate-600 leading-relaxed">
                ARIENDOS PUERTO VARAS SpA es una empresa legalmente constituida en Chile, dedicada a ofrecer soluciones integrales en el rubro de arriendos y experiencias turísticas. Nuestro objetivo es crear un ecosistema confiable y transparente, que conecte a prestadores de servicios locales con turistas y residentes, entregando seguridad y respaldo en cada transacción.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}