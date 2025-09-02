

'use client';
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import { createPageUrl } from "@/utils";
import {
  Home,
  Menu,
  ChevronDown,
  TreePine,
  Zap,
  Briefcase,
  LogOut,
  LayoutDashboard,
  Building2,
  Phone,
  Mail,
  Bot,
  Sparkles,
  BookOpen,
  Hotel,
  Wrench,
  User,
  X,
  Search,
  ChevronUp,
  MapPin,
  Star,
  Users,
  Facebook,
  Twitter,
  Linkedin,
  Globe,
  ArrowLeft, // Added ArrowLeft icon
  BarChart2 // Added BarChart2 icon for the new dashboard link
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from
"@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from
"@/components/ui/dropdown-menu";
import { toast } from "sonner";
import AuthSlot from "@/components/auth/AuthSlot";
import { setupGlobalErrorHandling, trackEvent } from '@/components/utils/EventTracker';
import { applySecurityPolicies } from '@/components/utils/securityUtils';
import ConsentBanner from '@/components/ConsentBanner';
import {
  captureToken,
  isAuthenticated,
  logout,
  login,
  loadCurrentUser,
  User as AuthUserType
} from
'@/components/utils/auth';
import JaimeChat from "@/components/ai/JaimeChat";
import ScrollToTop from "@/components/utils/ScrollToTop";
import { Instagram } from 'lucide-react';

import LanguageSelector from "@/components/ui/LanguageSelector";
import { useTranslation } from "@/components/utils/i18n";
import { SEOSettings } from '@/api/entities';

export default function Layout({ children, currentPageName }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');
  const [isMobileMenuOpen, setIsMobileMenu] = useState(false);
  const [isJaimeChatOpen, setIsJaimeChatOpen] = useState(false);
  const [gaTrackingId, setGaTrackingId] = useState('G-9ZGG23T6WF');
  const [analyticsSettings, setAnalyticsSettings] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false); // New state variable
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { t } = useTranslation();

  const assistanceLinks = [
    { nameKey: 'footer.help_center', href: createPageUrl("HelpCenter") },
    { nameKey: 'footer.faq', href: createPageUrl("HelpCenter") },
    { nameKey: 'footer.cancellation_policies', href: createPageUrl("HelpCategory") + '?slug=reservas' },
    { nameKey: 'footer.security_trust', href: createPageUrl("HelpCategory") + '?slug=seguridad' },
    { nameKey: 'footer.contact', href: createPageUrl("Contact") }];


  const advertisersLinks = [
    { nameKey: 'footer.become_host', href: createPageUrl("BecomeHost") },
    { nameKey: 'footer.list_property', href: createPageUrl("AddProperty") },
    { nameKey: 'footer.offer_service', href: createPageUrl("AddService") },
    { nameKey: 'footer.offer_experience', href: createPageUrl("AddService") + '?type=experiencia' },
    { nameKey: 'footer.new_advertiser_guide', href: createPageUrl("BecomeHost") }];


  const aboutLinks = [
    { nameKey: 'footer.about_us', href: createPageUrl("QuienesSomos") },
    { nameKey: 'footer.blog_news', href: createPageUrl("Blog") },
    { nameKey: 'footer.user_reviews', href: createPageUrl("Testimonials") },
    { nameKey: 'footer.investors_partners', href: '#' },
    { nameKey: 'footer.work_with_us', href: '#' }];


  const legalLinks = [
    { nameKey: 'footer.privacy', href: createPageUrl("PrivacyPolicy") },
    { nameKey: 'footer.terms_conditions', href: createPageUrl("TermsAndConditions") },
    { nameKey: 'footer.cookie_policy', href: createPageUrl("PrivacyPolicy") },
    { nameKey: 'footer.sitemap', href: createPageUrl("SiteMap") },
    { nameKey: 'footer.company_data', href: createPageUrl("CompanyData") }];


  const loadMe = async () => {
    setAuthStatus('loading');
    try {
      const tokenCaptured = captureToken();
      if (tokenCaptured) {
        console.log('Token captured in layout');
        trackEvent('login_success');
      }

      const user = await loadCurrentUser();
      setCurrentUser(user);
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');

      if (user) {
        trackEvent('user_session_active', { user_id: user.id });
      }
    } catch (error) {
      console.error('Error loading user in layout:', error);
      setCurrentUser(null);
      setAuthStatus('unauthenticated');
    }
  };

  const loadAnalyticsSettings = useCallback(async () => {
    try {
      const settings = await SEOSettings.filter({});
      if (settings.length > 0) {
        setAnalyticsSettings(settings[0]);
      } else {
        // Si no hay configuraciones, crear una por defecto
        console.log('No SEO settings found, creating default settings');
        const defaultSettings = await SEOSettings.create({
          ga_measurement_id: 'G-9ZGG23T6WF',
          ai_seo_enabled: true,
          target_language: 'both',
          max_publications_per_week: 3,
          target_keywords: ['arriendos puerto varas', 'cabañas puerto varas', 'alojamiento puerto varas'],
          cro_testing_enabled: true,
          auto_winner_selection: true,
          min_sample_size: 500,
          test_duration_days: 14,
          content_tone: 'local',
          schema_markup_enabled: true,
          sitemap_auto_update: true
        });
        setAnalyticsSettings(defaultSettings);
      }
    } catch (error) {
      console.warn('Error loading analytics settings:', error.message);
      // Usar configuraciones por defecto sin romper la aplicación
      setAnalyticsSettings({
        ga_measurement_id: 'G-9ZGG23T6WF',
        ai_seo_enabled: true,
        target_language: 'both'
      });
    }
  }, []);

  const initializeGoogleAnalytics = useCallback((trackingId) => {
    if (typeof window !== 'undefined' && trackingId) {
      const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id="]`);
      if (existingScript && !existingScript.src.includes(trackingId)) {
        existingScript.remove();
        delete window.gtag;
        delete window.dataLayer;
        console.log('Removed existing Google Analytics script for a different ID and cleared gtag.');
      } else if (existingScript && existingScript.src.includes(trackingId)) {
        console.log(`Google Analytics script for ${trackingId} already exists. Skipping re-initialization.`);
        if (typeof window.gtag === 'function') {
          return;
        } else {
          console.log(`Script for ${trackingId} exists, but gtag function is not defined. Re-initializing.`);
        }
      }

      if (document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${trackingId}"]`)) {
        console.log(`Google Analytics script for ${trackingId} already exists (after detailed check).`);
        if (typeof window.gtag === 'function') {
          return;
        }
      }

      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;

      gtag('js', new Date());

      gtag('config', trackingId, {
        send_page_view: false,
        page_title: document.title,
        page_location: window.location.href
      });

      gtag('consent', 'default', {
        analytics_storage: 'granted'
      });

      console.log(`Google Analytics initialized in SPA mode with ID: ${trackingId}`);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('access_token') || urlParams.has('token') || urlParams.has('auth_token');

    if (hasAuthParams) {
      console.log('Auth parameters detected, reloading user');
    }

    loadMe();

    // Check for SHOW_COMING_SOON setting
    const checkComingSoon = () => {
      // Try to get from localStorage or window
      const showSetting = 
        (typeof localStorage !== 'undefined' && localStorage.getItem('SHOW_COMING_SOON') === 'true') ||
        (typeof window !== 'undefined' && window.SHOW_COMING_SOON === 'true');
      
      setShowComingSoon(showSetting);
    };
    
    checkComingSoon();
  }, [location.pathname, location.search]);

  useEffect(() => {
    loadAnalyticsSettings();
  }, [loadAnalyticsSettings]);

  useEffect(() => {
    let idToUse = 'G-9ZGG23T6WF';

    if (analyticsSettings && analyticsSettings.ga_measurement_id) {
      idToUse = analyticsSettings.ga_measurement_id;
    }

    setGaTrackingId(idToUse);

    if (idToUse) {
      initializeGoogleAnalytics(idToUse);
    }
  }, [analyticsSettings, initializeGoogleAnalytics]);

  useEffect(() => {
    applySecurityPolicies();
    setupGlobalErrorHandling();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAuthStatus('unauthenticated');
      toast.info(t("auth.logged_out_message"));

      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Error al cerrar sesión");
    }
  };

  const handleLogin = async () => {
    try {
      console.log('Login button clicked');
      await login();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesión. Por favor, intenta nuevamente.");
    }
  };

  const renderAuthButton = () => {
    if (authStatus === 'loading') {
      return <div className="w-11 h-11 bg-slate-200 rounded-full animate-pulse"></div>;
    }

    if (currentUser) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="mr-20 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 neuro-icon-button neuro-auth-active">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser.profile_image_url} />
                <AvatarFallback>{currentUser.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="neuro-dropdown-menu">
            <DropdownMenuLabel className="neuro-dropdown-label">
              <div className="font-normal text-sm text-slate-500">{t('auth.logged_in_as')}</div>
              <div className="font-semibold">{currentUser.full_name}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="neuro-dropdown-item">
              <Link to={createPageUrl("MiCuenta")}><LayoutDashboard className="w-4 h-4 mr-2" /> {t('nav.my_account')}</Link>
            </DropdownMenuItem>

            {/* MODIFICACIÓN: Mostrar si es arrendador O admin/superadmin */}
            {(currentUser.user_type === 'arrendador' || currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
              <DropdownMenuItem asChild className="neuro-dropdown-item">
                <Link to={createPageUrl("Dashboard")}><BarChart2 className="w-4 h-4 mr-2" /> {t('nav.my_income_dashboard')}</Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem asChild className="neuro-dropdown-item">
              <Link to={createPageUrl("MyProperties")}><Building2 className="w-4 h-4 mr-2" /> {t('nav.my_properties')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="neuro-dropdown-item">
              <Link to={createPageUrl("MyBookings")}><Briefcase className="w-4 h-4 mr-2" /> {t('nav.my_bookings')}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="neuro-dropdown-item neuro-dropdown-logout">
              <LogOut className="w-4 h-4 mr-2" />
              {t('nav.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>);

    }

    return (
      <Button onClick={handleLogin} variant="ghost" className="neuro-icon-button neuro-login-button">
        <User className="w-5 h-5" />
      </Button>);

  };

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const isHomePage = currentPageName === 'Home';
  const navItemClass = "py-2 px-3 rounded-md hover:bg-slate-100 transition-colors duration-200 flex items-center gap-2 text-sm font-medium";
  const navItemTextClass = "hidden sm:inline";

  return (
    <>
      <ScrollToTop />
      <GAPageViewTracker />
      <div className="min-h-screen flex flex-col layout-main-container bg-white text-slate-800">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

          :root {
            --font-inter: 'Inter', sans-serif;
            --neu-bg: #e0e0e0;
            --neu-dark: #bebebe;
            --neu-light: #ffffff;
            --neu-primary: #fcc332;
            --neu-text: #333333;
            --neu-text-light: #6b7280;
            --neu-accent: #2563eb;
          }

          /* Apply Inter to the main layout container and global elements */
          .layout-main-container {
            font-family: var(--font-inter);
          }

          /* Input neumórfico mejorado - ¡SOBREESCRITURA FORZADA! */
          .neuro-input,
          input.neuro-input {
            background: var(--neu-bg) !important;
            border-radius: 8px !important;
            border: none !important;
            box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light) !important;
            color: var(--neu-text) !important;
            transition: all 0.2s ease-in-out !important;
            padding: 0.5rem 0.75rem !important;
            font-family: var(--font-inter) !important; /* Ensure inputs also get the font */
          }

          .neuro-input:focus,
          input.neuro-input:focus {
            outline: none !important;
            background: var(--neu-bg) !important;
            box-shadow: inset 1px 1px 2px var(--neu-dark), inset -1px -1px 2px var(--neu-light), 0 0 0 2px var(--neu-accent) !important;
          }

          .neuro-input::placeholder,
          input.neuro-input::placeholder {
            color: var(--neu-text-light) !important;
          }

          /* Asegurar que SelectTrigger también tenga el mismo estilo */
          button.neuro-input[role="combobox"] {
            background: var(--neu-bg) !important;
            border: none !important;
            box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light) !important;
            color: var(--neu-text) !important;
            font-family: var(--font-inter) !important;
          }

          button.neuro-input[role="combobox"]:focus {
            background: var(--neu-bg) !important;
            box-shadow: inset 1px 1px 2px var(--neu-dark), inset -1px -1px 2px var(--neu-light), 0 0 0 2px var(--neu-accent) !important;
          }

          .neuro-header {
            background-color: #e0e0e0;
          }

          .neuro-nav-button {
            background: #e0e0e0 !important;
            border-radius: 12px;
            padding: 0.75rem 1.25rem;
            box-shadow: 5px 5px 10px #bebebe, -5px -5px 10px #ffffff;
            transition: all 0.2s ease-in-out;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            color: #333333;
            text-decoration: none;
            font-family: var(--font-inter);
          }

          .neuro-nav-button:hover {
            background: #e0e0e0 !important;
            transform: translateY(-1px);
            box-shadow: 7px 7px 14px #bebebe, -7px -7px 14px #ffffff;
            color: #fcc332 !important;
          }
          
          .neuro-nav-button:active,
          .neuro-nav-button.is-active {
            background: #e0e0e0 !important;
            transform: translateY(0);
            box-shadow: inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff;
            color: #fcc332 !important;
          }
          
          .neuro-nav-button.is-active:hover {
            transform: translateY(0); /* Evita que el botón 'salte' al pasar el ratón */
          }

          /* Cambiar color de iconos en los botones de navegación */
          .neuro-nav-button:hover .lucide,
          .neuro-nav-button:active .lucide,
          .neuro-nav-button.is-active .lucide {
            color: #fcc332 !important;
          }

          .neuro-icon-button {
            background: #e0e0e0 !important;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 5px 5px 10px #bebebe, -5px -5px 10px #ffffff;
            transition: all 0.2s ease-in-out;
            color: #333333; 
            border: none;
            padding: 0;
          }

          .neuro-icon-button:hover {
            background: #e0e0e0 !important;
            transform: translateY(-1px);
            box-shadow: 7px 7px 14px #bebebe, -7px -7px 14px #ffffff;
            color: #fcc332 !important;
          }

          .neuro-icon-button:active,
          .neuro-icon-button.is-active,
          .neuro-login-button:active {
            background: #e0e0e0 !important;
            transform: translateY(0);
            box-shadow: inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff;
            color: #fcc332 !important; 
          }

          /* Cuando el botón de icono (como Home o perfil) está activo, no 'salta' al pasar el ratón */
          .neuro-icon-button.is-active:hover,
          .neuro-auth-active:hover {
            transform: translateY(0);
          }
          
          /* Estilo para el botón de perfil logeado */
          .neuro-auth-active {
            background: #e0e0e0 !important;
            transform: translateY(0) !important; /* Asegura que no se mueva */
            box-shadow: inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff !important;
          }
          
          .neuro-login-button .lucide {
            margin: 0 !important;
          }
          
          /* Menú desplegable neumórfico CORREGIDO */
          .neuro-dropdown-menu {
            background-color: var(--neu-bg) !important;
            border: none !important;
            box-shadow: inset 6px 6px 12px var(--neu-dark), inset -6px -6px 12px var(--neu-light) !important;
            border-radius: 16px !important;
            padding: 8px !important;
            min-width: 200px !important;
            font-family: var(--font-inter);
          }

          .neuro-dropdown-label {
            padding: 8px 12px !important;
            margin-bottom: 4px !important;
            text-align: center;
            font-family: var(--font-inter);
          }

          .neuro-dropdown-item {
            background: var(--neu-bg) !important;
            border-radius: 8px !important;
            margin: 4px 8px !important; /* Más espacio vertical y los hace más angostos */
            padding: 5px 10px !important; /* Menos relleno para hacerlos más pequeños */
            box-shadow: 3px 3px 5px var(--neu-dark), -3px -3px 5px var(--neu-light) !important;
            transition: all 0.2s ease-in-out !important;
            color: #333333 !important;
            font-size: 0.875rem !important;
            display: flex;
            align-items: center;
            font-family: var(--font-inter);
          }

          .neuro-dropdown-item:hover {
            box-shadow: 5px 5px 10px var(--neu-dark), -5px -5px 10px var(--neu-light) !important;
            transform: translateY(-1px) !important;
          }

          .neuro-dropdown-item:active {
            box-shadow: inset 2px 2px 4px var(--neu-dark), inset -2px -2px 4px var(--neu-light) !important;
            transform: translateY(0) !important;
          }
          
          .neuro-dropdown-menu [role="separator"] {
             margin: 6px 4px !important;
             background-color: var(--neu-dark) !important;
             height: 1px !important;
          }

          .neuro-dropdown-logout {
            color: #dc2626 !important;
          }

          .neuro-dropdown-logout:hover {
            color: #dc2626 !important;
          }
        `}</style>
        <header className="sticky top-0 z-40 w-full neuro-header">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-2"> {/* Added a div to group buttons */}
                {/* Botón Volver Atrás - oculto en Home */}
                {!isHomePage &&
                  <Button
                    onClick={handleBackButtonClick}
                    variant="ghost"
                    className="neuro-icon-button">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                }

                <Link to={createPageUrl("Home")}>
                  <Button variant="ghost" className="ml-6 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 neuro-icon-button">
                    <Home className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <nav className="hidden md:flex items-center gap-4">
                <Link to={createPageUrl("Properties")} className={`mr-20 neuro-nav-button ${location.pathname.startsWith(createPageUrl("Properties")) ? 'is-active' : ''}`}>
                  <Hotel className="w-4 h-4" />
                  <span>{t('nav.properties')}</span>
                </Link>
                <Link to={createPageUrl("ServicesHub")} className={`mr-16 neuro-nav-button ${location.pathname.startsWith(createPageUrl("ServicesHub")) ? 'is-active' : ''}`}>
                  <TreePine className="w-4 h-4" />
                  <span>{t('nav.services')}</span>
                </Link>

                {/* Coming Soon Link - Conditional */}
                {showComingSoon && (
                  <Link to={createPageUrl("Proximamente")} className={`mr-16 neuro-nav-button ${location.pathname.startsWith(createPageUrl("Proximamente")) ? 'is-active' : ''}`}>
                    <Sparkles className="w-4 h-4" />
                    <span>Próximamente</span>
                  </Link>
                )}

                <Dialog open={isJaimeChatOpen} onOpenChange={setIsJaimeChatOpen}>
                  <DialogTrigger asChild>
                    <div className="neuro-nav-button cursor-pointer">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <div className="text-xs text-left">
                        <div className="font-semibold text-blue-800">{t('jaime.have_questions')}</div>
                        <div className="text-blue-600 hover:text-blue-700 font-medium">{t('jaime.ask_jaime')}</div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="p-0 max-w-2xl h-[90vh] flex flex-col">
                    <JaimeChat
                      isModal={true}
                      onClose={() => setIsJaimeChatOpen(false)} />
                  </DialogContent>
                </Dialog>
              </nav>

              <div className="flex items-center gap-2">
                {renderAuthButton()}
                <LanguageSelector />

                <div className="md:hidden">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenu}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="neuro-icon-button">
                        <Menu />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <nav className="flex flex-col space-y-4 mt-8 text-lg">
                        <Link to={createPageUrl("Home")} onClick={() => setIsMobileMenu(false)}>{t('nav.home')}</Link>
                        <Link to={createPageUrl("Properties")} onClick={() => setIsMobileMenu(false)}>{t('nav.properties')}</Link>
                        <Link to={createPageUrl("ServicesHub")} onClick={() => setIsMobileMenu(false)}>{t('nav.services')}</Link>
                        {showComingSoon && (
                          <Link to={createPageUrl("Proximamente")} onClick={() => setIsMobileMenu(false)}>Próximamente</Link>
                        )}
                        <a href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenu(false); setIsJaimeChatOpen(true); }} className="font-semibold text-blue-600">{t('jaime.ask_jaime')}</a>
                        <Link to={createPageUrl("BecomeHost")} onClick={() => setIsMobileMenu(false)} className="border-t pt-4">{t('nav.offer_your_space')}</Link>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow bg-[#e0e0e0]">
          {children}
        </main>

        {isHomePage &&
          <>
            <div className="fold-effect"></div>

            <footer className="neuro-footer">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  <div className="neuro-footer-card">
                    <h3 className="neuro-footer-title">{t('footer.assistance')}</h3>
                    <ul className="neuro-footer-links">
                      {assistanceLinks.map((link) =>
                        <li key={link.nameKey}>
                          <a href={link.href} className="neuro-footer-link">
                            {t(link.nameKey)}
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="neuro-footer-card">
                    <h3 className="neuro-footer-title">{t('footer.operators')}</h3>
                    <ul className="neuro-footer-links">
                      {advertisersLinks.map((link) =>
                        <li key={link.nameKey}>
                          <a href={link.href} className="neuro-footer-link">
                            {t(link.nameKey)}
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="neuro-footer-card">
                    <h3 className="neuro-footer-title">{t('footer.about')}</h3>
                    <ul className="neuro-footer-links">
                      {aboutLinks.map((link) =>
                        <li key={link.nameKey}>
                          <a href={link.href} className="neuro-footer-link">
                            {t(link.nameKey)}
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="neuro-footer-card">
                    <h3 className="neuro-footer-title">{t('footer.legal')}</h3>
                    <ul className="neuro-footer-links">
                      {legalLinks.map((link) =>
                        <li key={link.nameKey}>
                          <a href={link.href} className="neuro-footer-link">
                            {t(link.nameKey)}
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-300">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex justify-center space-x-6">
                      <a
                        href="https://www.instagram.com/arriendospuertovaras.cl"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram de Arriendos Puerto Varas"
                        className="neuro-social-link">
                        <Instagram className="w-6 h-6" />
                      </a>
                    </div>

                    <div className="text-center text-sm text-slate-600">
                      <p>&copy; {new Date().getFullYear()} Arriendos Puerto Varas. {t('footer.rights_reserved')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </footer>

            <style>{`
              /* Efecto de doblez/papel doblado */
              .fold-effect {
                height: 20px;
                background: linear-gradient(135deg, 
                  #e0e0e0 0%, 
                  #d0d0d0 25%, 
                  #bebebe 50%, 
                  #d0d0d0 75%, 
                  #e0e0e0 100%
                );
                box-shadow: 
                  inset 0 2px 4px rgba(0,0,0,0.1),
                  0 -2px 8px rgba(255,255,255,0.8);
                position: relative;
              }

              .fold-effect::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(190,190,190,0.5) 50%, 
                  transparent 100%
                );
              }

              /* Footer neumórfico */
              .neuro-footer {
                background-color: #e0e0e0;
                color: #333333;
              }

              .neuro-footer-card {
                background: #e0e0e0;
                border-radius: 16px;
                padding: 1.5rem;
                box-shadow: 
                  6px 6px 12px #bebebe, 
                  -6px -6px 12px #ffffff;
                transition: all 0.3s ease;
              }

              .neuro-footer-card:hover {
                box-shadow: 
                  8px 8px 16px #bebebe, 
                  -8px -8px 16px #ffffff;
                transform: translateY(-1px);
              }

              .neuro-footer-title {
                font-weight: 600;
                font-size: 1rem;
                margin-bottom: 1rem;
                text-align: center;
                color: #333333;
                font-family: var(--font-inter);
              }

              .neuro-footer-links {
                list-style: none;
                padding: 0;
                margin: 0;
              }

              .neuro-footer-links li {
                margin-bottom: 0.5rem; 
                text-align: center;
              }

              .neuro-footer-link {
                color: #333333;
                text-decoration: none;
                font-size: 0.875rem;
                transition: color 0.2s ease;
                display: block;
                padding: 0.25rem 0;
                font-family: var(--font-inter);
              }

              .neuro-footer-link:hover,
              .neuro-footer-link:active {
                color: #fcc332;
                text-decoration: none;
              }

              .neuro-social-link {
                color: #666666;
                transition: color 0.2s ease;
              }

              .neuro-social-link:hover {
                color: #fcc332;
              }

              /* Responsive adjustments */
              @media (max-width: 768px) {
                .neuro-footer-card {
                  padding: 1rem;
                  border-radius: 12px;
                  box-shadow: 
                    4px 4px 8px #bebebe, 
                    -4px -4px 8px #ffffff;
                }
              }
            `}</style>
          </>
        }
      </div>
      <ConsentBanner />
    </>
  );
}

function GAPageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      setTimeout(() => {
        window.gtag('event', 'page_view', {
          page_location: window.location.href,
          page_path: window.location.pathname + window.location.search,
          page_title: document.title
        });

        console.log('GA4 page_view sent:', {
          page_location: window.location.href,
          page_path: window.location.pathname + window.location.search,
          page_title: document.title
        });
      }, 100);
    }
  }, [location.pathname, location.search]);

  return null;
}

