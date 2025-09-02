import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { auditAndFixSEO } from '@/components/utils/seoAudit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2, Play } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import AdminLayout from '@/components/admin/AdminLayout';

export default function SEOAuditPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState(null);

  useEffect(() => {
    checkAuthAndLoadUser();
  }, []);

  const checkAuthAndLoadUser = async () => {
    try {
      const userData = await User.me();
      if (userData.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(userData);
    } catch (error) {
      window.location.href = '/';
    }
    setLoading(false);
  };

  const runAudit = async () => {
    setAuditing(true);
    try {
      const results = await auditAndFixSEO();
      setAuditResults(results);
    } catch (error) {
      console.error('Audit failed:', error);
      setAuditResults({
        issues: ['Error ejecutando auditoría SEO'],
        fixes: ['Revisa los logs del sistema para más detalles']
      });
    }
    setAuditing(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Auditoría SEO</h1>
            <p className="text-gray-600 mt-2">
              Diagnóstico y corrección automática del módulo SEO
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Ejecutar Auditoría SEO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Esta auditoría revisará y corregirá automáticamente:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>Configuración básica de SEO faltante</li>
              <li>Páginas críticas sin títulos o meta descriptions</li>
              <li>Títulos muy largos (más de 60 caracteres)</li>
              <li>Meta descriptions muy largas (más de 155 caracteres)</li>
              <li>Keywords objetivo no definidas</li>
              <li>Configuración de sitemap</li>
            </ul>
            
            <Button 
              onClick={runAudit} 
              disabled={auditing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {auditing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ejecutando Auditoría...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Ejecutar Auditoría
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {auditResults && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Resultados de la Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Problemas Identificados ({auditResults.issues.length})
                    </h3>
                    {auditResults.issues.length > 0 ? (
                      <ul className="space-y-2">
                        {auditResults.issues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Badge variant="destructive" className="text-xs">
                              {index + 1}
                            </Badge>
                            <span className="text-sm">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Alert>
                        <CheckCircle className="w-4 h-4" />
                        <AlertDescription>
                          No se encontraron problemas críticos de SEO.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Correcciones Aplicadas ({auditResults.fixes.length})
                    </h3>
                    {auditResults.fixes.length > 0 ? (
                      <ul className="space-y-2">
                        {auditResults.fixes.map((fix, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                              {index + 1}
                            </Badge>
                            <span className="text-sm">{fix}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          No fueron necesarias correcciones automáticas.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Auditoría completada.</strong> Todas las correcciones se han aplicado automáticamente. 
                Los cambios ya están activos en el sitio web.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}