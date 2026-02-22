import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/outfit/300.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";

import "@/index.css";
import "@/App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages - TV Display
import TVDisplay from "@/pages/TVDisplay";
import Login from "@/pages/Login";

// Pages - Dashboard Admin
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import IdentityPage from "@/pages/dashboard/IdentityPage";
import DisplayContentPage from "@/pages/dashboard/DisplayContentPage";
import LayoutPage from "@/pages/dashboard/LayoutPage";
import PrayerSettingsPage from "@/pages/dashboard/PrayerSettingsPage";
import RamadanAdminPage from "@/pages/dashboard/RamadanAdminPage";
import ZISPage from "@/pages/dashboard/ZISPage";
import AnnouncementsPage from "@/pages/dashboard/AnnouncementsPage";
import ArticlesPage from "@/pages/dashboard/ArticlesPage";
import PengurusPage from "@/pages/dashboard/PengurusPage";
import SpecialEventsPage from "@/pages/dashboard/SpecialEventsPage";
import AdminGalleryPage from "@/pages/dashboard/GalleryPage";
import QuotesPage from "@/pages/dashboard/QuotesPage";
import QRISSettingsPage from "@/pages/dashboard/QRISSettingsPage";

// Pages - Website
import HomePage from "@/pages/website/HomePage";
import AgendaPage from "@/pages/website/AgendaPage";
import AboutPage from "@/pages/website/AboutPage";
import InformasiPage from "@/pages/website/InformasiPage";
import PublicGalleryPage from "@/pages/website/GalleryPage";

// Pages - Ramadan
import RamadanPage from "@/pages/ramadan/RamadanPage";

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <Toaster position="top-right" richColors />
                <BrowserRouter>
                    <Routes>
                        {/* TV Display - Main public page (jamsholat subdomain) */}
                        <Route path="/" element={<TVDisplay />} />
                        
                        {/* Website Homepage (main domain) */}
                        <Route path="/homepage" element={<HomePage />} />
                        <Route path="/homepage/agenda" element={<AgendaPage />} />
                        <Route path="/homepage/about" element={<AboutPage />} />
                        <Route path="/homepage/informasi" element={<InformasiPage />} />
                        <Route path="/homepage/gallery" element={<PublicGalleryPage />} />
                        
                        {/* Ramadan Channel (ramadan subdomain) */}
                        <Route path="/ramadan" element={<RamadanPage />} />
                        
                        {/* Admin Login */}
                        <Route path="/connect" element={<Login />} />
                        
                        {/* Protected Dashboard Routes (admin subdomain) */}
                        <Route 
                            path="/connect" 
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="dashboard" element={<DashboardHome />} />
                            <Route path="identity" element={<IdentityPage />} />
                            <Route path="display-content" element={<DisplayContentPage />} />
                            <Route path="layout" element={<LayoutPage />} />
                            <Route path="prayer-settings" element={<PrayerSettingsPage />} />
                            <Route path="zis" element={<ZISPage />} />
                            <Route path="announcements" element={<AnnouncementsPage />} />
                            <Route path="articles" element={<ArticlesPage />} />
                            <Route path="pengurus" element={<PengurusPage />} />
                            <Route path="special-events" element={<SpecialEventsPage />} />
                            <Route path="gallery" element={<AdminGalleryPage />} />
                            <Route path="quotes" element={<QuotesPage />} />
                            <Route path="qris" element={<QRISSettingsPage />} />
                            <Route path="ramadan" element={<RamadanAdminPage />} />
                        </Route>
                        
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </AuthProvider>
    );
}

export default App;
