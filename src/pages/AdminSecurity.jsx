import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Eye,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

const SECURITY_POLICIES = {
  Property: {
    title: "Property",
    description: "Propiedades y alojamientos",
    icon: Database,
    status: "critical",
    policies: [
      "Listado público SOLO a través de /functions/publicProperties",
      "Public Read: BLOQUEADO (o Creator Only si el editor obliga)",
      "Auth Read: Creator Only (el dueño ve lo suyo)",
      "Auth Create: ON",
      "Auth Update: ON con owner_id == current user", 
      "Delete: OFF",
      "Admin/Service: Full access",
      "Protegidos: published y owner_id no editables desde cliente"
    ]
  },
  Booking: {
    title: "Booking", 
    description: "Reservas de propiedades",
    icon: Lock,
    status: "critical",
    policies: [
      "Read: guest_id == current user OR owner_id == current user",
      "Create: OFF (las reservas se crean con /functions/createBooking)",
      "Update/Delete: OFF (estados/montos solo backend)",
      "Admin/Service: Full access"
    ]
  },
  Payment: {
    title: "Payment",
    description: "Pagos y transacciones", 
    icon: Shield,
    status: "critical",
    policies: [
      "Read: user_id == current user OR owner_id == current user",
      "Write/Delete (Auth): OFF (los pagos los crea/actualiza backend)",
      "Admin/Service: Full access"
    ]
  },
  PaymentMethod: {
    title: "PaymentMethod",
    description: "Métodos de pago disponibles",
    icon: Settings,
    status: "high",
    policies: [
      "Public/Auth: TODO OFF",
      "Admin/Service: Full (si soporte lo necesita)"
    ]
  },
  Service: {
    title: "Service", 
    description: "Servicios profesionales",
    icon: Eye,
    status: "medium",
    policies: [
      "Read: provider_id == current user OR público si status == activo",
      "Write/Delete (Auth): OFF (crear/actualizar por funciones)",
      "Admin/Service: Full access"
    ]
  },
  ServiceBooking: {
    title: "ServiceBooking",
    description: "Reservas de servicios",
    icon: Edit,
    status: "medium", 
    policies: [
      "Read: customer_id == current user OR provider_id == current user",
      "Write/Delete (Auth): OFF (crear/actualizar por funciones)",
      "Admin/Service: Full access"
    ]
  }
};

const SECURITY_CHECKS = [
  {
    id: 'public_properties_endpoint',
    title: '/functions/publicProperties responde correctamente',
    description: 'La función devuelve { ok:true, items:[...] }',
    type: 'endpoint'
  },
  {
    id: 'commission_secrets',
    title: 'Secrets de comisiones presentes',
    description: 'COMISION_PERCENT, IVA_PERCENT están configurados',
    type: 'secrets'
  },
  {
    id: 'webpay_secrets', 
    title: 'Secrets de Webpay configurados',
    description: 'TBK_BASE_URL, TBK_COMMERCE_CODE, TBK_API_KEY_SECRET, TBK_RETURN_URL, TBK_SUCCESS_URL, TBK_FAILURE_URL',
    type: 'secrets'
  },
  {
    id: 'rls_policies_applied',
    title: 'Políticas RLS aplicadas correctamente',
    description: 'Todas las entidades críticas tienen las reglas de seguridad configuradas',
    type: 'database'
  }
];

export default function AdminSecurityPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifiedPolicies, setVerifiedPolicies] = useState({});
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    loadUser();
    loadLocalState();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalState = () => {
    const verified = localStorage.getItem('admin_verified_policies');
    const checked = localStorage.getItem('admin_security_checks');
    
    if (verified) {
      try {
        setVerifiedPolicies(JSON.parse(verified));
      } catch (e) {
        console.error('Error parsing verified policies:', e);
      }
    }
    
    if (checked) {
      try {
        setCheckedItems(JSON.parse(checked));
      } catch (e) {
        console.error('Error parsing checked items:', e);
      }
    }
  };

  const markAsVerified = (entityName) => {
    const newVerified = {
      ...verifiedPolicies,
      [entityName]: {
        verified: true,
        timestamp: new Date().toISOString(),
        verifiedBy: user?.email || 'unknown'
      }
    };
    setVerifiedPolicies(newVerified);
    localStorage.setItem('admin_verified_policies', JSON.stringify(newVerified));
  };

  const toggleCheck = (checkId) => {
    const newChecked = {
      ...checkedItems,
      [checkId]: !checkedItems[checkId]
    };
    setCheckedItems(newChecked);
    localStorage.setItem('admin_security_checks', JSON.stringify(newChecked));
  };

  const openEntityRules = (entityName) => {
    // Navegar al dashboard de datos
    window.open('/dashboard/data', '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      default: return 'Bajo';
    }
  };

  return (
    <AdminAuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Shield className="inline-block mr-3 text-blue-600" />
            Centro de Seguridad
          </h1>
          <p className="text-gray-600">
            Configuración y verificación de políticas de seguridad para entidades críticas
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Toda lectura pública de propiedades debe realizarse exclusivamente a través de <code>/functions/publicProperties</code>. 
            El acceso directo a entidades desde el frontend debe estar restringido por RLS.
          </AlertDescription>
        </Alert>

        {/* Grid de Políticas de Entidades */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Políticas de Seguridad por Entidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(SECURITY_POLICIES).map(([entityName, policy]) => {
              const Icon = policy.icon;
              const isVerified = verifiedPolicies[entityName]?.verified;
              
              return (
                <Card key={entityName} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Icon className="w-5 h-5 mr-2" />
                        {policy.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(policy.status)} text-white`}>
                          {getStatusText(policy.status)}
                        </Badge>
                        {isVerified && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{policy.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {policy.policies.map((policyText, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded font-mono">
                          {policyText}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEntityRules(entityName)}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Abrir Reglas
                      </Button>
                      <Button 
                        variant={isVerified ? "secondary" : "default"}
                        size="sm"
                        onClick={() => markAsVerified(entityName)}
                        className="flex-1"
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Verificado
                          </>
                        ) : (
                          'Marcar Verificado'
                        )}
                      </Button>
                    </div>
                    
                    {isVerified && (
                      <div className="mt-2 text-xs text-gray-500">
                        Verificado el {new Date(verifiedPolicies[entityName].timestamp).toLocaleDateString()} 
                        por {verifiedPolicies[entityName].verifiedBy}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sección de Comprobaciones */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Comprobaciones del Sistema</h2>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Verificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SECURITY_CHECKS.map((check) => (
                  <div key={check.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={check.id}
                      checked={checkedItems[check.id] || false}
                      onCheckedChange={() => toggleCheck(check.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={check.id} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {check.title}
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        {check.description}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {check.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Progreso General</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(Object.values(checkedItems).filter(Boolean).length / SECURITY_CHECKS.length) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-blue-800">
                    {Object.values(checkedItems).filter(Boolean).length} / {SECURITY_CHECKS.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthGuard>
  );
}