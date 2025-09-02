import React, { useState, useEffect } from "react";
import { ReferralProgram } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  Mail, 
  MessageSquare,
  DollarSign,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function ReferralSystem() {
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [newReferralEmail, setNewReferralEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingRewards: 0,
    totalRewards: 0
  });

  useEffect(() => {
    loadUserAndReferrals();
  }, []);

  const loadUserAndReferrals = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Generate referral code if user doesn't have one
      const code = userData.referral_code || generateReferralCode(userData.id);
      setReferralCode(code);
      
      // Load user's referrals
      const userReferrals = await ReferralProgram.filter({ referrer_id: userData.id });
      setReferrals(userReferrals);
      
      // Calculate stats
      const completed = userReferrals.filter(r => r.status === 'completed').length;
      const pendingRewards = userReferrals.filter(r => r.status === 'completed' && !r.reward_claimed).length;
      const totalRewards = userReferrals
        .filter(r => r.reward_claimed)
        .reduce((sum, r) => sum + (r.reward_value || 0), 0);
      
      setStats({
        totalReferrals: userReferrals.length,
        completedReferrals: completed,
        pendingRewards,
        totalRewards
      });
      
    } catch (error) {
      console.error("Error loading referrals:", error);
    }
  };

  const generateReferralCode = (userId) => {
    return `PV${userId.substring(0, 8).toUpperCase()}`;
  };

  const sendReferral = async (e) => {
    e.preventDefault();
    if (!newReferralEmail) {
      toast.error("Ingresa el email de tu amigo");
      return;
    }

    setLoading(true);
    try {
      await ReferralProgram.create({
        referrer_id: user.id,
        referrer_email: user.email,
        referred_email: newReferralEmail,
        referral_code: referralCode,
        reward_type: "discount_percentage",
        reward_value: 15,
        reward_description: "15% de descuento en tu primera reserva",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      });

      toast.success("¡Invitación enviada! Tu amigo recibirá un email con tu recomendación.");
      setNewReferralEmail("");
      loadUserAndReferrals();
    } catch (error) {
      toast.error("Error al enviar la invitación");
    }
    setLoading(false);
  };

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    toast.success("¡Enlace copiado! Compártelo con tus amigos.");
  };

  const shareReferralLink = () => {
    const referralUrl = `${window.location.origin}?ref=${referralCode}`;
    const text = `¡Descubre Arriendos Puerto Varas! Encuentra alojamientos increíbles y obtén 15% de descuento en tu primera reserva con mi código: ${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Arriendos Puerto Varas',
        text: text,
        url: referralUrl,
      });
    } else {
      // Fallback: open WhatsApp or Telegram
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralUrl)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Inicia sesión para acceder al programa de referidos</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <div className="text-sm text-slate-600">Referidos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.completedReferrals}</div>
            <div className="text-sm text-slate-600">Completados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <div className="text-2xl font-bold">{stats.pendingRewards}</div>
            <div className="text-sm text-slate-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">${stats.totalRewards.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Ganado</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invite">Invitar Amigos</TabsTrigger>
          <TabsTrigger value="history">Mis Referidos</TabsTrigger>
        </TabsList>

        <TabsContent value="invite">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-6 h-6 text-blue-600" />
                <span>Invita y Gana</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">¿Cómo funciona?</h3>
                <ol className="text-blue-800 text-sm space-y-1">
                  <li>1. Invita a tus amigos con tu código único</li>
                  <li>2. Ellos obtienen 15% de descuento en su primera reserva</li>
                  <li>3. Tú recibes $5.000 CLP cuando completen su primera reserva</li>
                  <li>4. ¡Sin límite de invitaciones!</li>
                </ol>
              </div>

              {/* Referral Code */}
              <div>
                <Label>Tu Código de Referido</Label>
                <div className="flex space-x-2 mt-2">
                  <Input value={referralCode} readOnly className="font-mono text-center text-lg" />
                  <Button onClick={copyReferralLink} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button onClick={shareReferralLink} variant="outline">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Send Email Invitation */}
              <form onSubmit={sendReferral} className="space-y-4">
                <div>
                  <Label htmlFor="friendEmail">Invitar por Email</Label>
                  <Input
                    id="friendEmail"
                    type="email"
                    value={newReferralEmail}
                    onChange={(e) => setNewReferralEmail(e.target.value)}
                    placeholder="email@amigo.com"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Invitación
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Referidos</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aún no has referido a ningún amigo</p>
                  <p className="text-sm">¡Comienza a invitar y ganar recompensas!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{referral.referred_email}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(referral.created_date).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          referral.status === 'completed' ? 'default' :
                          referral.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {referral.status === 'completed' ? 'Completado' :
                           referral.status === 'pending' ? 'Pendiente' : 'Expirado'}
                        </Badge>
                        {referral.status === 'completed' && (
                          <p className="text-sm text-green-600 mt-1">
                            +${referral.reward_value?.toLocaleString()} CLP
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}