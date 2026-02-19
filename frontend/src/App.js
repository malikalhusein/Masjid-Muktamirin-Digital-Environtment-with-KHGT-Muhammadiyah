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

// Pages
import TVDisplay from "@/pages/TVDisplay";
import TVDisplayClassic from "@/pages/TVDisplayClassic";
import TVDisplayLayout2 from "@/pages/TVDisplayLayout2";
import Login from "@/pages/Login";
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import IdentityPage from "@/pages/dashboard/IdentityPage";
import ContentPage from "@/pages/dashboard/ContentPage";
import AgendaPage from "@/pages/dashboard/AgendaPage";
import RunningTextPage from "@/pages/dashboard/RunningTextPage";
import LayoutPage from "@/pages/dashboard/LayoutPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <Toaster position="top-right" richColors />
                <BrowserRouter>
                    <Routes>
                        {/* TV Display - Main public page with different layouts */}
                        <Route path="/" element={<TVDisplay />} />
                        <Route path="/classic" element={<TVDisplayClassic />} />
                        <Route path="/layout2" element={<TVDisplayLayout2 />} />
                        
                        {/* Admin Login */}
                        <Route path="/connect" element={<Login />} />
                        
                        {/* Protected Dashboard Routes */}
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
                            <Route path="content" element={<ContentPage />} />
                            <Route path="agenda" element={<AgendaPage />} />
                            <Route path="running-text" element={<RunningTextPage />} />
                            <Route path="layout" element={<LayoutPage />} />
                            <Route path="settings" element={<SettingsPage />} />
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
