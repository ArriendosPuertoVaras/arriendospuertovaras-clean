import Layout from "./Layout.jsx";

import Properties from "./Properties";

import PropertyDetail from "./PropertyDetail";

import MyBookings from "./MyBookings";

import MyProperties from "./MyProperties";

import AddProperty from "./AddProperty";

import Profile from "./Profile";

import TermsAndConditions from "./TermsAndConditions";

import AddService from "./AddService";

import Services from "./Services";

import Dashboard from "./Dashboard";

import AdminSEO from "./AdminSEO";

import Blog from "./Blog";

import LastMinuteDeals from "./LastMinuteDeals";

import PrivacyPolicy from "./PrivacyPolicy";

import HelpCenter from "./HelpCenter";

import HelpCategory from "./HelpCategory";

import HelpArticle from "./HelpArticle";

import BecomeHost from "./BecomeHost";

import HostWizard from "./HostWizard";

import MiCuenta from "./MiCuenta";

import MyServices from "./MyServices";

import ServicesHub from "./ServicesHub";

import ServiceDetail from "./ServiceDetail";

import BlogPost from "./BlogPost";

import BlogPostDetail from "./BlogPostDetail";

import ReferralProgram from "./ReferralProgram";

import SEOManagement from "./SEOManagement";

import SiteMap from "./SiteMap";

import ShareLink from "./ShareLink";

import UnifiedDashboard from "./UnifiedDashboard";

import QuienesSomos from "./QuienesSomos";

import Testimonials from "./Testimonials";

import Contact from "./Contact";

import ContactUnified from "./ContactUnified";

import AdminOperators from "./AdminOperators";

import AdminReviews from "./AdminReviews";

import Admin from "./Admin";

import Home from "./Home";

import AdminDashboard from "./AdminDashboard";

import AdminTickets from "./AdminTickets";

import AdminSettings from "./AdminSettings";

import JaimeAPI from "./JaimeAPI";

import AdminKnowledgeBase from "./AdminKnowledgeBase";

import JaimeWeatherAPI from "./JaimeWeatherAPI";

import robots from "./robots";

// import sitemap from "./sitemap";

import AdminErrors from "./AdminErrors";

import CompanyData from "./CompanyData";

import SEOAudit from "./SEOAudit";

import ServiceCategoryDetail from "./ServiceCategoryDetail";

import sitemap_pages from "./sitemap_pages";

import sitemap_listings from "./sitemap_listings";

import AdminFinanzas from "./AdminFinanzas";

import AdminPublicaciones from "./AdminPublicaciones";

import AdminComentarios from "./AdminComentarios";

import AdminSoporteErrores from "./AdminSoporteErrores";

import AdminUsuarios from "./AdminUsuarios";

import AdminAuditoria from "./AdminAuditoria";

import PagoExito from "./PagoExito";

import PagoError from "./PagoError";

import Newsletter from "./Newsletter";

import AdminOperadores from "./AdminOperadores";

import AdminConfiguracion from "./AdminConfiguracion";

import RestorePropertyImages from "./RestorePropertyImages";

import AdminPhotoModeration from "./AdminPhotoModeration";

import AdminSEOMarketing from "./AdminSEOMarketing";

import PaymentWebpayReturn from "./PaymentWebpayReturn";

import AdminSecurity from "./AdminSecurity";

import Proximamente from "./Proximamente";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Properties: Properties,
    
    PropertyDetail: PropertyDetail,
    
    MyBookings: MyBookings,
    
    MyProperties: MyProperties,
    
    AddProperty: AddProperty,
    
    Profile: Profile,
    
    TermsAndConditions: TermsAndConditions,
    
    AddService: AddService,
    
    Services: Services,
    
    Dashboard: Dashboard,
    
    AdminSEO: AdminSEO,
    
    Blog: Blog,
    
    LastMinuteDeals: LastMinuteDeals,
    
    PrivacyPolicy: PrivacyPolicy,
    
    HelpCenter: HelpCenter,
    
    HelpCategory: HelpCategory,
    
    HelpArticle: HelpArticle,
    
    BecomeHost: BecomeHost,
    
    HostWizard: HostWizard,
    
    MiCuenta: MiCuenta,
    
    MyServices: MyServices,
    
    ServicesHub: ServicesHub,
    
    ServiceDetail: ServiceDetail,
    
    BlogPost: BlogPost,
    
    BlogPostDetail: BlogPostDetail,
    
    ReferralProgram: ReferralProgram,
    
    SEOManagement: SEOManagement,
    
    SiteMap: SiteMap,
    
    ShareLink: ShareLink,
    
    UnifiedDashboard: UnifiedDashboard,
    
    QuienesSomos: QuienesSomos,
    
    Testimonials: Testimonials,
    
    Contact: Contact,
    
    ContactUnified: ContactUnified,
    
    AdminOperators: AdminOperators,
    
    AdminReviews: AdminReviews,
    
    Admin: Admin,
    
    Home: Home,
    
    AdminDashboard: AdminDashboard,
    
    AdminTickets: AdminTickets,
    
    AdminSettings: AdminSettings,
    
    JaimeAPI: JaimeAPI,
    
    AdminKnowledgeBase: AdminKnowledgeBase,
    
    JaimeWeatherAPI: JaimeWeatherAPI,
    
    robots: robots,
    
    sitemap: sitemap,
    
    AdminErrors: AdminErrors,
    
    CompanyData: CompanyData,
    
    SEOAudit: SEOAudit,
    
    ServiceCategoryDetail: ServiceCategoryDetail,
    
    sitemap_pages: sitemap_pages,
    
    sitemap_listings: sitemap_listings,
    
    AdminFinanzas: AdminFinanzas,
    
    AdminPublicaciones: AdminPublicaciones,
    
    AdminComentarios: AdminComentarios,
    
    AdminSoporteErrores: AdminSoporteErrores,
    
    AdminUsuarios: AdminUsuarios,
    
    AdminAuditoria: AdminAuditoria,
    
    PagoExito: PagoExito,
    
    PagoError: PagoError,
    
    Newsletter: Newsletter,
    
    AdminOperadores: AdminOperadores,
    
    AdminConfiguracion: AdminConfiguracion,
    
    RestorePropertyImages: RestorePropertyImages,
    
    AdminPhotoModeration: AdminPhotoModeration,
    
    AdminSEOMarketing: AdminSEOMarketing,
    
    PaymentWebpayReturn: PaymentWebpayReturn,
    
    AdminSecurity: AdminSecurity,
    
    Proximamente: Proximamente,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Properties />} />
                
                
                <Route path="/Properties" element={<Properties />} />
                
                <Route path="/PropertyDetail" element={<PropertyDetail />} />
                
                <Route path="/MyBookings" element={<MyBookings />} />
                
                <Route path="/MyProperties" element={<MyProperties />} />
                
                <Route path="/AddProperty" element={<AddProperty />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
                
                <Route path="/AddService" element={<AddService />} />
                
                <Route path="/Services" element={<Services />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/AdminSEO" element={<AdminSEO />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/LastMinuteDeals" element={<LastMinuteDeals />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/HelpCenter" element={<HelpCenter />} />
                
                <Route path="/HelpCategory" element={<HelpCategory />} />
                
                <Route path="/HelpArticle" element={<HelpArticle />} />
                
                <Route path="/BecomeHost" element={<BecomeHost />} />
                
                <Route path="/HostWizard" element={<HostWizard />} />
                
                <Route path="/MiCuenta" element={<MiCuenta />} />
                
                <Route path="/MyServices" element={<MyServices />} />
                
                <Route path="/ServicesHub" element={<ServicesHub />} />
                
                <Route path="/ServiceDetail" element={<ServiceDetail />} />
                
                <Route path="/BlogPost" element={<BlogPost />} />
                
                <Route path="/BlogPostDetail" element={<BlogPostDetail />} />
                
                <Route path="/ReferralProgram" element={<ReferralProgram />} />
                
                <Route path="/SEOManagement" element={<SEOManagement />} />
                
                <Route path="/SiteMap" element={<SiteMap />} />
                
                <Route path="/ShareLink" element={<ShareLink />} />
                
                <Route path="/UnifiedDashboard" element={<UnifiedDashboard />} />
                
                <Route path="/QuienesSomos" element={<QuienesSomos />} />
                
                <Route path="/Testimonials" element={<Testimonials />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/ContactUnified" element={<ContactUnified />} />
                
                <Route path="/AdminOperators" element={<AdminOperators />} />
                
                <Route path="/AdminReviews" element={<AdminReviews />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/AdminTickets" element={<AdminTickets />} />
                
                <Route path="/AdminSettings" element={<AdminSettings />} />
                
                <Route path="/JaimeAPI" element={<JaimeAPI />} />
                
                <Route path="/AdminKnowledgeBase" element={<AdminKnowledgeBase />} />
                
                <Route path="/JaimeWeatherAPI" element={<JaimeWeatherAPI />} />
                
                <Route path="/robots" element={<robots />} />
                
                <Route path="/sitemap" element={<sitemap />} />
                
                <Route path="/AdminErrors" element={<AdminErrors />} />
                
                <Route path="/CompanyData" element={<CompanyData />} />
                
                <Route path="/SEOAudit" element={<SEOAudit />} />
                
                <Route path="/ServiceCategoryDetail" element={<ServiceCategoryDetail />} />
                
                <Route path="/sitemap_pages" element={<sitemap_pages />} />
                
                <Route path="/sitemap_listings" element={<sitemap_listings />} />
                
                <Route path="/AdminFinanzas" element={<AdminFinanzas />} />
                
                <Route path="/AdminPublicaciones" element={<AdminPublicaciones />} />
                
                <Route path="/AdminComentarios" element={<AdminComentarios />} />
                
                <Route path="/AdminSoporteErrores" element={<AdminSoporteErrores />} />
                
                <Route path="/AdminUsuarios" element={<AdminUsuarios />} />
                
                <Route path="/AdminAuditoria" element={<AdminAuditoria />} />
                
                <Route path="/PagoExito" element={<PagoExito />} />
                
                <Route path="/PagoError" element={<PagoError />} />
                
                <Route path="/Newsletter" element={<Newsletter />} />
                
                <Route path="/AdminOperadores" element={<AdminOperadores />} />
                
                <Route path="/AdminConfiguracion" element={<AdminConfiguracion />} />
                
                <Route path="/RestorePropertyImages" element={<RestorePropertyImages />} />
                
                <Route path="/AdminPhotoModeration" element={<AdminPhotoModeration />} />
                
                <Route path="/AdminSEOMarketing" element={<AdminSEOMarketing />} />
                
                <Route path="/PaymentWebpayReturn" element={<PaymentWebpayReturn />} />
                
                <Route path="/AdminSecurity" element={<AdminSecurity />} />
                
                <Route path="/Proximamente" element={<Proximamente />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}