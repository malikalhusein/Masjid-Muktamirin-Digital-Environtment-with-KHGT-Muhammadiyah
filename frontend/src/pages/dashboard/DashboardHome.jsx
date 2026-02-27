import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, CalendarDays, Type, Clock, MapPin, RefreshCw, Wallet, Users, Globe, ArrowRight, Plus } from 'lucide-react';
import { statsAPI, prayerAPI, mosqueAPI, zisAPI, pengurusAPI, articleAPI, specialEventAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { formatTime, formatDateIndonesian, PRAYER_NAMES } from '../../lib/utils';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
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
                        <p className="text-2xl font-heading text-white mt-1">{value}</p>
                        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
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
    const [zisSummary, setZisSummary] = useState(null);
    const [pengurusCount, setPengurusCount] = useState(0);
    const [articleCount, setArticleCount] = useState(0);
    const [upcomingAgendas, setUpcomingAgendas] = useState(0);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();

            const [statsRes, prayerRes, mosqueRes, zisRes, pengurusRes, articleRes, agendaRes] = await Promise.all([
                statsAPI.get(),
                prayerAPI.getTimes(),
                mosqueAPI.getIdentity(),
                zisAPI.getSummary(currentMonth, currentYear),
                pengurusAPI.getAll(true),
                articleAPI.getAll(true),
                specialEventAPI.getAll(true, true)
            ]);

            setStats(statsRes.data);
            setPrayerTimes(prayerRes.data);
            setMosque(mosqueRes.data);
            setZisSummary(zisRes.data);
            setPengurusCount(pengurusRes.data?.length || 0);
            setArticleCount(articleRes.data?.length || 0);
            setUpcomingAgendas(agendaRes.data?.length || 0);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Kas ZIS Bulan Ini"
                    value={formatCurrency(zisSummary?.grand_total || 0)}
                    subtitle={`${zisSummary?.zakat?.count + zisSummary?.infaq?.count + zisSummary?.shodaqoh?.count || 0} Total Transaksi`}
                    icon={Wallet}
                    color="bg-emerald-600"
                />
                <StatCard
                    title="Agenda Mendatang"
                    value={upcomingAgendas}
                    subtitle={`${stats?.active_agendas || 0} Total Agenda`}
                    icon={CalendarDays}
                    color="bg-amber-600"
                />
                <StatCard
                    title="Artikel Diterbitkan"
                    value={articleCount}
                    icon={Globe}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Pengurus Takmir"
                    value={pengurusCount}
                    icon={Users}
                    color="bg-purple-600"
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
                        Jalan pintas ke menu pengelolaan utama
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2 border-slate-700 bg-slate-800/50 hover:bg-emerald-900/40 hover:border-emerald-500/50"
                            asChild
                        >
                            <Link to="/connect/zis">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-1">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-slate-300 font-medium">Input ZIS</span>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2 border-slate-700 bg-slate-800/50 hover:bg-amber-900/40 hover:border-amber-500/50"
                            asChild
                        >
                            <Link to="/connect/special-events">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-1">
                                    <CalendarDays className="w-5 h-5 text-amber-400" />
                                </div>
                                <span className="text-slate-300 font-medium">Tambah Agenda</span>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2 border-slate-700 bg-slate-800/50 hover:bg-blue-900/40 hover:border-blue-500/50"
                            asChild
                        >
                            <Link to="/connect/articles">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-slate-300 font-medium">Tulis Artikel</span>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2 border-slate-700 bg-slate-800/50 hover:bg-purple-900/40 hover:border-purple-500/50"
                            asChild
                        >
                            <Link to="/connect/announcements">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-1">
                                    <Type className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-slate-300 font-medium">Pengumuman</span>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-2 border-slate-700 bg-slate-800/50 hover:bg-teal-900/40 hover:border-teal-500/50 lg:col-span-1 col-span-2"
                            asChild
                        >
                            <Link to="/connect/prayer-settings">
                                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center mb-1">
                                    <Clock className="w-5 h-5 text-teal-400" />
                                </div>
                                <span className="text-slate-300 font-medium">Atur Jadwal</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
