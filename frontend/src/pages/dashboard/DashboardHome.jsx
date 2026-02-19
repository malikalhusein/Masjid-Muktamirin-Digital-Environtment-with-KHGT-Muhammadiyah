import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, CalendarDays, Type, Clock, MapPin, RefreshCw } from 'lucide-react';
import { statsAPI, prayerAPI, mosqueAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { formatTime, formatDateIndonesian, PRAYER_NAMES } from '../../lib/utils';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <Card className="bg-slate-900/80 border-slate-800">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-body">{title}</p>
                        <p className="text-3xl font-heading text-white mt-1">{value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

export default function DashboardHome() {
    const [stats, setStats] = useState(null);
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [mosque, setMosque] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const fetchData = async () => {
        try {
            const [statsRes, prayerRes, mosqueRes] = await Promise.all([
                statsAPI.get(),
                prayerAPI.getTimes(),
                mosqueAPI.getIdentity(),
            ]);
            setStats(statsRes.data);
            setPrayerTimes(prayerRes.data);
            setMosque(mosqueRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8" data-testid="dashboard-home">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl text-white">Dashboard</h1>
                    <p className="text-slate-400 font-body mt-1">
                        Selamat datang di panel admin Jam Sholat Digital
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    data-testid="refresh-button"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="Konten Aktif" 
                    value={stats?.active_contents || 0}
                    icon={Image}
                    color="bg-emerald-600"
                />
                <StatCard 
                    title="Agenda Aktif" 
                    value={stats?.active_agendas || 0}
                    icon={CalendarDays}
                    color="bg-gold-600"
                />
                <StatCard 
                    title="Running Text" 
                    value={stats?.active_running_texts || 0}
                    icon={Type}
                    color="bg-teal-600"
                />
            </div>
            
            {/* Mosque Info & Prayer Times */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mosque Info */}
                <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                            Identitas Masjid
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-slate-400 text-sm">Nama Masjid</p>
                                <p className="text-white font-body text-lg" data-testid="mosque-name-display">
                                    {mosque?.name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Alamat</p>
                                <p className="text-white font-body">{mosque?.address || '-'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm">Latitude</p>
                                    <p className="text-white font-mono text-sm">{mosque?.latitude}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Longitude</p>
                                    <p className="text-white font-mono text-sm">{mosque?.longitude}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Prayer Times */}
                <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-emerald-400" />
                            Jadwal Sholat Hari Ini
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {formatDateIndonesian()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya', 'terbit'].map((prayer) => (
                                <div 
                                    key={prayer}
                                    className="bg-slate-800/50 rounded-lg p-3 text-center"
                                    data-testid={`prayer-time-${prayer}`}
                                >
                                    <p className="text-slate-400 text-sm uppercase tracking-wider">
                                        {PRAYER_NAMES[prayer]?.id || prayer}
                                    </p>
                                    <p className="text-white font-heading text-2xl mt-1 tabular-nums">
                                        {formatTime(prayerTimes?.[prayer])}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Quick Actions */}
            <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                    <CardTitle className="font-heading text-xl text-white">Aksi Cepat</CardTitle>
                    <CardDescription className="text-slate-400">
                        Kelola konten dan pengaturan display
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button 
                            variant="outline" 
                            className="h-auto py-4 flex flex-col gap-2 border-slate-700 hover:bg-emerald-900/30 hover:border-emerald-600"
                            asChild
                        >
                            <a href="/connect/content">
                                <Image className="w-6 h-6 text-emerald-400" />
                                <span className="text-slate-300">Tambah Konten</span>
                            </a>
                        </Button>
                        <Button 
                            variant="outline" 
                            className="h-auto py-4 flex flex-col gap-2 border-slate-700 hover:bg-gold-900/30 hover:border-gold-600"
                            asChild
                        >
                            <a href="/connect/agenda">
                                <CalendarDays className="w-6 h-6 text-gold-400" />
                                <span className="text-slate-300">Tambah Agenda</span>
                            </a>
                        </Button>
                        <Button 
                            variant="outline" 
                            className="h-auto py-4 flex flex-col gap-2 border-slate-700 hover:bg-teal-900/30 hover:border-teal-600"
                            asChild
                        >
                            <a href="/connect/settings">
                                <Clock className="w-6 h-6 text-teal-400" />
                                <span className="text-slate-300">Atur Iqomah</span>
                            </a>
                        </Button>
                        <Button 
                            variant="outline" 
                            className="h-auto py-4 flex flex-col gap-2 border-slate-700 hover:bg-purple-900/30 hover:border-purple-600"
                            asChild
                        >
                            <a href="/" target="_blank">
                                <Clock className="w-6 h-6 text-purple-400" />
                                <span className="text-slate-300">Lihat Display</span>
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
