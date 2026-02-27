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
import { useEffect } from "react";
import { mosqueAPI } from "@/lib/api";

// Favicon & Title Updater
function FaviconUpdater() {
    useEffect(() => {
        const updateFaviconAndTitle = async () => {
            try {
                const res = await mosqueAPI.getIdentity();
                if (res.data) {
                    // Update Title
                    if (res.data.name) {
                        document.title = res.data.name;
                    }
                    // Update Favicon
                    if (res.data.logo_url) {
                        let link = document.querySelector("link[rel~='icon']");
                        if (!link) {
                            link = document.createElement('link');
                            link.rel = 'icon';
                            document.getElementsByTagName('head')[0].appendChild(link);
                        }
                        link.href = res.data.logo_url;
                    }
                }
            } catch (error) {
                console.error("Gagal sinkronisasi opsi Favicon:", error);
            }
        };
        updateFaviconAndTitle();
    }, []);

    return null;
}

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
import SpecialEventsPage from "@/pages/dashboard/SpecialEventsPage";
import AdminGalleryPage from "@/pages/dashboard/GalleryPage";
import QuotesPage from "@/pages/dashboard/QuotesPage";
import AdminUsersPage from "@/pages/dashboard/AdminUsersPage";

// Pages - Website
import HomePage from "@/pages/website/HomePage";
import AgendaPage from "@/pages/website/AgendaPage";
import AboutPage from "@/pages/website/AboutPage";
import InformasiPage from "@/pages/website/InformasiPage";
import PublicGalleryPage from "@/pages/website/GalleryPage";
import ArticlesPublicPage from "@/pages/website/ArticlesPublicPage";

// Pages - Ramadan
import RamadanPage from "@/pages/ramadan/RamadanPage";

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <FaviconUpdater />
                <Toaster position="top-right" richColors />
                <BrowserRouter>
                    <Routes>
                        {/* Website Homepage (main domain) */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/agenda" element={<AgendaPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/informasi" element={<InformasiPage />} />
                        <Route path="/gallery" element={<PublicGalleryPage />} />
                        <Route path="/artikel" element={<ArticlesPublicPage />} />

                        {/* TV Display - Jam Sholat */}
                        <Route path="/jamsholat" element={<TVDisplay />} />

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
                            <Route path="special-events" element={<SpecialEventsPage />} />
                            <Route path="gallery" element={<AdminGalleryPage />} />
                            <Route path="quotes" element={<QuotesPage />} />
                            <Route path="ramadan" element={<RamadanAdminPage />} />
                            <Route path="users" element={<AdminUsersPage />} />
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
