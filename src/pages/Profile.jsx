
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Property } from "@/api/entities";
import { Payment } from "@/api/entities";
import { createPageUrl } from '@/utils';
import {
  User as UserIcon,
  CreditCard,
  Building2,
  Star,
  TrendingUp,
  Award,
  Edit,
  Save,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BackButton from "@/components/ui/BackButton";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    profile_image: '',
    bank_name: '',
    account_type: '',
    account_number: '',
    account_holder_name: '',
    rut: '',
    bank_email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [userProperties, setUserProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [isViewer, setIsViewer] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        setIsViewer(userData.user_type === 'viewer');
        setFormData({
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          location: userData.location || '',
          bio: userData.bio || '',
          profile_image: userData.profile_image || '',
          bank_name: userData.bank_name || '',
          account_type: userData.account_type || '',
          account_number: userData.account_number || '',
          account_holder_name: userData.account_holder_name || '',
          rut: userData.rut || '',
          bank_email: userData.bank_email || ''
        });

        if (userData.user_type === 'arrendador') {
          const properties = await Property.filter({ owner_id: userData.id });
          setUserProperties(properties);
          setFeaturedProperties(properties.filter(p => p.featured));
        }
      } catch (error) {
        // Usar URL limpia sin parámetros problemáticos
        const url = new URL(window.location.href);
        ['logout','access_token','id_token','code','state'].forEach(p => url.searchParams.delete(p));
        const cleanUrl = url.origin + url.pathname + (url.search || '');
        await User.loginWithRedirect(cleanUrl);
      }
      setLoading(false);
    };
    checkAuthAndLoadData();
  }, []);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio
      });
      setEditingProfile(false);
      toast.success("Perfil actualizado correctamente");
      // Re-fetch user data to update the UI
      const updatedUser = await User.me();
      setUser(updatedUser);
      // Update formData with potentially new user data (e.g., if backend normalizes values)
      setFormData(prevData => ({
        ...prevData,
        full_name: updatedUser.full_name || '',
        phone: updatedUser.phone || '',
        location: updatedUser.location || '',
        bio: updatedUser.bio || ''
      }));
    } catch (error) {
      toast.error("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleBankSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        bank_name: formData.bank_name,
        account_type: formData.account_type,
        account_number: formData.account_number,
        account_holder_name: formData.account_holder_name,
        rut: formData.rut,
        bank_email: formData.bank_email
      });
      setEditingBank(false);
      toast.success("Datos bancarios actualizados correctamente");
      // Re-fetch user data to update the UI
      const updatedUser = await User.me();
      setUser(updatedUser);
      // Update formData with potentially new user data
      setFormData(prevData => ({
        ...prevData,
        bank_name: updatedUser.bank_name || '',
        account_type: updatedUser.account_type || '',
        account_number: updatedUser.account_number || '',
        account_holder_name: updatedUser.account_holder_name || '',
        rut: updatedUser.rut || '',
        bank_email: updatedUser.bank_email || ''
      }));
    } catch (error) {
      toast.error("Error al actualizar los datos bancarios");
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureProperty = async (propertyId) => {
    setSaving(true); // Using saving state for this operation as well
    try {
      // Simulate payment process
      const featuredUntil = new Date();
      featuredUntil.setMonth(featuredUntil.getMonth() + 1);

      await Property.update(propertyId, {
        featured: true,
        featured_until: featuredUntil.toISOString().split('T')[0]
      });

      // Create payment record
      await Payment.create({
        type: 'featured_promotion',
        amount: 10000,
        user_id: user.id,
        property_id: propertyId,
        status: 'completado',
        platform_commission: 10000, // Full amount goes to platform
        owner_amount: 0,
        payment_method: 'webpay'
      });

      toast.success("¡Propiedad destacada por 30 días! El pago se procesará automáticamente.");
      // Re-fetch properties to update the UI
      const properties = await Property.filter({ owner_id: user.id });
      setUserProperties(properties);
      setFeaturedProperties(properties.filter(p => p.featured));
    } catch (error) {
      toast.error("Error al destacar la propiedad");
    } finally {
      setSaving(false);
    }
  };

  const chileanBanks = [
    "Banco de Chile",
    "Banco Santander",
    "BancoEstado",
    "Banco BCI",
    "Banco Security",
    "Banco Falabella",
    "Banco Ripley",
    "Banco Consorcio",
    "Banco Internacional",
    "Banco de Crédito e Inversiones",
    "Banco BICE",
    "Banco Paris",
    "Scotiabank Chile"
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If loading is false but user is null, it means there was an issue or redirect is pending.
  // In a real application, the User.loginWithRedirect call should prevent reaching this state.
  // Returning null here acts as a fallback for safety.
  if (!user) {
    return null;
  }
  
  const crumbs = [
    { label: 'Mi Cuenta', href: createPageUrl('MiCuenta') },
    { label: 'Perfil y Pagos' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div className="flex-1">
          <Breadcrumbs crumbs={crumbs} />
        </div>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Mi Perfil</h1>
      
      {isViewer && (
        <Alert variant="default" className="mb-8 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-800">Modo Solo Lectura</AlertTitle>
          <AlertDescription className="text-blue-700">
            Estás viendo este perfil como "Viewer". Las acciones de edición y guardado están deshabilitadas.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Profile */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>Información Personal</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingProfile(!editingProfile);
                  // Reset formData if canceling edit
                  if (editingProfile) {
                    setFormData({
                      ...formData,
                      full_name: user.full_name || '',
                      phone: user.phone || '',
                      location: user.location || '',
                      bio: user.bio || ''
                    });
                  }
                }}
                disabled={isViewer}
              >
                <Edit className="w-4 h-4 mr-1" />
                {editingProfile ? 'Cancelar' : 'Editar'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile && !isViewer ? (
                <>
                  <div>
                    <Label htmlFor="full_name">Nombre Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ciudad, Región"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>
                  <Button onClick={handleProfileSave} className="btn-primary" disabled={saving || isViewer}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <p className="text-slate-900">{user.full_name || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-slate-900">{user.email}</p>
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <p className="text-slate-900">{user.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <p className="text-slate-900">{user.location || 'No especificado'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Biografía</Label>
                    <p className="text-slate-900">{user.bio || 'No especificado'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Configuration for Landlords */}
          {user.user_type === 'arrendador' && !isViewer && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Configuración Bancaria para Pagos</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingBank(!editingBank);
                    // Reset formData if canceling edit
                    if (editingBank) {
                      setFormData({
                        ...formData,
                        bank_name: user.bank_name || '',
                        account_type: user.account_type || '',
                        account_number: user.account_number || '',
                        account_holder_name: user.account_holder_name || '',
                        rut: user.rut || '',
                        bank_email: user.bank_email || ''
                      });
                    }
                  }}
                  disabled={isViewer}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {editingBank ? 'Cancelar' : 'Editar'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Configura tu cuenta para recibir tus pagos. El precio que defines para tus propiedades o servicios es tu ingreso base. De ese monto, nuestra plataforma deduce una tarifa de servicio del 15%, a la cual se le aplica el 19% de IVA. El IVA se añade al precio final que paga el cliente, asegurando transparencia total.
                  </AlertDescription>
                </Alert>

                {editingBank && !isViewer ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bank_name">Banco</Label>
                        <Select value={formData.bank_name} onValueChange={(value) => setFormData({...formData, bank_name: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu banco" />
                          </SelectTrigger>
                          <SelectContent>
                            {chileanBanks.map(bank => (
                              <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="account_type">Tipo de Cuenta</Label>
                        <Select value={formData.account_type} onValueChange={(value) => setFormData({...formData, account_type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo de cuenta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cuenta_corriente">Cuenta Corriente</SelectItem>
                            <SelectItem value="cuenta_vista">Cuenta Vista</SelectItem>
                            <SelectItem value="cuenta_rut">Cuenta RUT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="account_number">Número de Cuenta</Label>
                      <Input
                        id="account_number"
                        value={formData.account_number}
                        onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_holder_name">Nombre del Titular</Label>
                      <Input
                        id="account_holder_name"
                        value={formData.account_holder_name}
                        onChange={(e) => setFormData({...formData, account_holder_name: e.target.value})}
                        placeholder="Juan Pérez Rodríguez"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rut">RUT del Titular</Label>
                      <Input
                        id="rut"
                        value={formData.rut}
                        onChange={(e) => setFormData({...formData, rut: e.target.value})}
                        placeholder="12.345.678-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_email">Email de Notificaciones Bancarias</Label>
                      <Input
                        id="bank_email"
                        type="email"
                        value={formData.bank_email}
                        onChange={(e) => setFormData({...formData, bank_email: e.target.value})}
                        placeholder="tu-email@ejemplo.com"
                      />
                    </div>
                    <Button onClick={handleBankSave} className="btn-primary" disabled={saving || isViewer}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? 'Guardando...' : 'Guardar Datos Bancarios'}
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Banco</Label>
                      <p className="text-slate-900">{user.bank_name || 'No configurado'}</p>
                    </div>
                    <div>
                      <Label>Tipo de Cuenta</Label>
                      <p className="text-slate-900">{user.account_type || 'No especificado'}</p>
                    </div>
                    <div>
                      <Label>Número de Cuenta</Label>
                      <p className="text-slate-900">
                        {user.account_number ? `***${user.account_number.slice(-4)}` : 'No configurado'}
                      </p>
                    </div>
                    <div>
                      <Label>Titular</Label>
                      <p className="text-slate-900">{user.account_holder_name || 'No especificado'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Featured Properties for Landlords */}
          {user.user_type === 'arrendador' && userProperties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Destacar Propiedades</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Destaca tus propiedades por $10.000 CLP al mes para aparecer primero en las búsquedas y obtener más reservas.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {userProperties.map(property => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{property.title}</h4>
                        <p className="text-sm text-slate-600">{property.location}</p>
                        {property.featured && (
                          <Badge className="mt-1 bg-[var(--brand-yellow)] text-black">
                            Destacada hasta {property.featured_until}
                          </Badge>
                        )}
                      </div>
                      {!property.featured && (
                        <Button
                          size="sm"
                          onClick={() => handleFeatureProperty(property.id)}
                          className="bg-[var(--brand-yellow)] text-black hover:bg-yellow-500"
                          disabled={saving || isViewer}
                        >
                          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Award className="w-4 h-4 mr-1" />
                          {saving ? 'Procesando...' : 'Destacar $10.000'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Calificación</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-medium">{user.rating > 0 ? user.rating.toFixed(1) : 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Reseñas</span>
                <span className="font-medium">{user.total_reviews || 0}</span>
              </div>
              {user.user_type === 'arrendador' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Propiedades</span>
                    <span className="font-medium">{userProperties.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Destacadas</span>
                    <span className="font-medium">{featuredProperties.length}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Email</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Verificado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Teléfono</span>
                  <Badge variant={user.phone ? "default" : "secondary"}
                         className={user.phone ? "bg-green-100 text-green-800" : ""}>
                    {user.phone ? 'Verificado' : 'Pendiente'}
                  </Badge>
                </div>
                {user.user_type === 'arrendador' && (
                  <div className="flex items-center justify-between">
                    <span>Cuenta Bancaria</span>
                    <Badge variant={user.bank_name ? "default" : "secondary"}
                           className={user.bank_name ? "bg-green-100 text-green-800" : ""}>
                      {user.bank_name ? 'Configurada' : 'Pendiente'}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
