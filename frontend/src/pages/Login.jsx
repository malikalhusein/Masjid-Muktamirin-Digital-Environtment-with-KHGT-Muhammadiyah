import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Login() {
    const navigate = useNavigate();
    const { login, error, setError } = useAuth();
    const [loading, setLoading] = useState(false);

    // Login form state
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(loginUsername, loginPassword);
        setLoading(false);
        if (success) {
            navigate('/connect/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" data-testid="login-page">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1739477274868-86a943b6cd5b?w=1920')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/95 to-emerald-950/50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-900/50 border-2 border-emerald-500 mb-4">
                        <span className="font-arabic text-4xl text-emerald-300">م</span>
                    </div>
                    <h1 className="font-heading text-3xl text-white uppercase tracking-wide">Dashboard Admin</h1>
                    <p className="font-body text-slate-400 mt-2">Jam Sholat Digital KHGT</p>
                </div>

                <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800">
                    <CardHeader className="space-y-1">
                        <CardTitle className="font-heading text-2xl text-white">Masuk ke Dashboard</CardTitle>
                        <CardDescription className="text-slate-400">
                            Kelola konten dan pengaturan jam sholat digital
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="flex items-center gap-2 p-3 mb-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400" data-testid="auth-error">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-username" className="text-slate-300">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="login-username"
                                        data-testid="login-username"
                                        type="text"
                                        placeholder="Masukkan username"
                                        value={loginUsername}
                                        onChange={(e) => {
                                            setLoginUsername(e.target.value);
                                            setError(null);
                                        }}
                                        className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="login-password"
                                        data-testid="login-password"
                                        type="password"
                                        placeholder="Masukkan password"
                                        value={loginPassword}
                                        onChange={(e) => {
                                            setLoginPassword(e.target.value);
                                            setError(null);
                                        }}
                                        className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                data-testid="login-submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-body"
                                disabled={loading}
                            >
                                {loading ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-500 text-sm mt-6 font-body">
                    © {new Date().getFullYear()} Masjid Muktamirin Sorogaten
                </p>
            </motion.div>
        </div>
    );
}
