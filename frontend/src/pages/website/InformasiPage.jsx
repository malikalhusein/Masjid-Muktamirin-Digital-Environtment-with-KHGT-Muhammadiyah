import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    Wallet, 
    TrendingUp, 
    Calendar, 
    ChevronRight,
    MapPin,
    Phone,
    QrCode,
    Heart,
    DollarSign
} from 'lucide-react';
import { zisAPI, qrisAPI, mosqueAPI } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { WebsiteNavigation, WebsiteFooter } from '../../components/WebsiteNavigation';

// QRIS Image URL (fallback)
const DEFAULT_QRIS_URL = "https://customer-assets.emergentagent.com/job_bc2fce28-e700-491a-980a-47d0af39ffe4/artifacts/tunkmt2e_QRIS%20Modif%4010x-100%20Large.jpeg";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function InformasiPage() {
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [qrisSettings, setQrisSettings] = useState(null);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchData = useCallback(async () => {
        try {
            const [summaryRes, chartRes, qrisRes, mosqueRes] = await Promise.all([
                zisAPI.getSummary(),
                zisAPI.getMonthlyChart(selectedYear),
                qrisAPI.getSettings().catch(() => ({ data: null })),
                mosqueAPI.getIdentity()
            ]);
            setSummary(summaryRes.data);
            setChartData(chartRes.data);
            setQrisSettings(qrisRes.data);
            setMosqueIdentity(mosqueRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Prepare pie chart data
    const pieData = summary ? [
        { name: 'Zakat', value: summary.zakat?.total || 0 },
        { name: 'Infaq', value: summary.infaq?.total || 0 },
        { name: 'Shodaqoh', value: summary.shodaqoh?.total || 0 },
    ].filter(d => d.value > 0) : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100" data-testid="informasi-page">
            <WebsiteNavigation activePage="informasi" mosqueIdentity={mosqueIdentity} />
            
            {/* Header */}
            <div className="bg-emerald-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-emerald-400 text-sm uppercase tracking-wider mb-2">MASJID MUKTAMIRIN</p>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Informasi & Laporan ZIS</h1>
                    <p className="text-emerald-300">Transparansi pengelolaan Zakat, Infaq, dan Shodaqoh</p>
                </div>
            </div>
            
            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-700" />
                            </div>
                            <span className="text-gray-500 text-sm">Zakat</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700">{formatCurrency(summary?.zakat?.total || 0)}</p>
                        <p className="text-xs text-gray-400">{summary?.zakat?.count || 0} transaksi</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-blue-700" />
                            </div>
                            <span className="text-gray-500 text-sm">Infaq</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{formatCurrency(summary?.infaq?.total || 0)}</p>
                        <p className="text-xs text-gray-400">{summary?.infaq?.count || 0} transaksi</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-amber-700" />
                            </div>
                            <span className="text-gray-500 text-sm">Shodaqoh</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-700">{formatCurrency(summary?.shodaqoh?.total || 0)}</p>
                        <p className="text-xs text-gray-400">{summary?.shodaqoh?.count || 0} transaksi</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-sm p-6 text-white">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-emerald-100 text-sm">Total Bulan Ini</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(summary?.grand_total || 0)}</p>
                        <p className="text-xs text-emerald-200">{monthNames[(summary?.month || 1) - 1]} {summary?.year}</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-600" />
                                Grafik ZIS Bulanan
                            </h2>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="border border-gray-200 rounded-lg px-3 py-1 text-sm"
                            >
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="month" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Legend />
                                <Bar dataKey="zakat" name="Zakat" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="infaq" name="Infaq" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="shodaqoh" name="Shodaqoh" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-800 mb-6">Komposisi Bulan Ini</h2>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-gray-400">
                                <p>Belum ada data bulan ini</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* QRIS Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <QrCode className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800">Donasi Sekarang</h2>
                            <p className="text-sm text-gray-500">Scan QRIS atau transfer ke rekening</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* QRIS */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center">
                            <img 
                                src={qrisSettings?.qris_image_url || DEFAULT_QRIS_URL} 
                                alt="QRIS Masjid Muktamirin" 
                                className="max-w-[220px] mx-auto rounded-lg shadow-md mb-4"
                            />
                            <div className="flex justify-center gap-2 flex-wrap">
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Infaq</span>
                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">Zakat</span>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Sedekah</span>
                            </div>
                        </div>
                        
                        {/* Bank Transfer */}
                        <div className="flex flex-col justify-center">
                            <p className="text-gray-500 text-sm mb-4">Atau transfer ke rekening:</p>
                            <div className="bg-emerald-50 rounded-xl p-6">
                                <p className="text-emerald-600 font-medium">{qrisSettings?.bank_name || 'BSI (Bank Syariah Indonesia)'}</p>
                                <p className="text-3xl font-mono font-bold text-gray-800 my-2">{qrisSettings?.account_number || '7148254552'}</p>
                                <p className="text-gray-500">a.n. {qrisSettings?.account_name || 'Masjid Muktamirin'}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                * Konfirmasi transfer dapat dikirim via WhatsApp ke 0812-1554-551
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <WebsiteFooter mosqueIdentity={mosqueIdentity} />
        </div>
    );
}
