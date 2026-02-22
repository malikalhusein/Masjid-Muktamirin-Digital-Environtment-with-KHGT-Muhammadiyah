import { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, Trash2, Edit2, TrendingUp, DollarSign, Heart } from 'lucide-react';
import { zisAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ZIS_TYPES = [
    { value: 'zakat', label: 'Zakat', color: 'emerald' },
    { value: 'infaq', label: 'Infaq', color: 'blue' },
    { value: 'shodaqoh', label: 'Shodaqoh', color: 'amber' },
];

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export default function ZISPage() {
    const [reports, setReports] = useState([]);
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        type: 'infaq',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        donor_name: ''
    });
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const fetchData = useCallback(async () => {
        try {
            const [reportsRes, summaryRes, chartRes] = await Promise.all([
                zisAPI.getAll(filterMonth, filterYear),
                zisAPI.getSummary(filterMonth, filterYear),
                zisAPI.getMonthlyChart(filterYear)
            ]);
            setReports(reportsRes.data);
            setSummary(summaryRes.data);
            setChartData(chartRes.data);
        } catch (error) {
            console.error('Error fetching ZIS data:', error);
            toast.error('Gagal memuat data ZIS');
        } finally {
            setLoading(false);
        }
    }, [filterMonth, filterYear]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.date) {
            toast.error('Jumlah dan tanggal harus diisi');
            return;
        }

        try {
            const data = { ...formData, amount: parseFloat(formData.amount) };
            if (editingItem) {
                await zisAPI.update(editingItem.id, data);
                toast.success('Laporan ZIS berhasil diperbarui');
            } else {
                await zisAPI.create(data);
                toast.success('Laporan ZIS berhasil ditambahkan');
            }
            setDialogOpen(false);
            setEditingItem(null);
            setFormData({ type: 'infaq', amount: '', description: '', date: new Date().toISOString().split('T')[0], donor_name: '' });
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan laporan ZIS');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            type: item.type,
            amount: item.amount.toString(),
            description: item.description || '',
            date: item.date,
            donor_name: item.donor_name || ''
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus laporan ini?')) return;
        try {
            await zisAPI.delete(id);
            toast.success('Laporan berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus laporan');
        }
    };

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="zis-page">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Wallet className="w-7 h-7 text-emerald-400" />
                        Laporan ZIS
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Kelola laporan Zakat, Infaq, dan Shodaqoh</p>
                </div>
                <Button onClick={() => { setEditingItem(null); setFormData({ type: 'infaq', amount: '', description: '', date: new Date().toISOString().split('T')[0], donor_name: '' }); setDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-zis-btn">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Laporan
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300 text-sm">Zakat</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary?.zakat?.total || 0)}</p>
                    <p className="text-xs text-slate-400">{summary?.zakat?.count || 0} transaksi</p>
                </div>
                <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-300 text-sm">Infaq</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary?.infaq?.total || 0)}</p>
                    <p className="text-xs text-slate-400">{summary?.infaq?.count || 0} transaksi</p>
                </div>
                <div className="bg-amber-900/30 border border-amber-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-300 text-sm">Shodaqoh</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary?.shodaqoh?.total || 0)}</p>
                    <p className="text-xs text-slate-400">{summary?.shodaqoh?.count || 0} transaksi</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-white" />
                        <span className="text-slate-300 text-sm">Total {monthNames[filterMonth - 1]}</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{formatCurrency(summary?.grand_total || 0)}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Grafik ZIS Tahun {filterYear}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                        <Legend />
                        <Bar dataKey="zakat" name="Zakat" fill="#10B981" />
                        <Bar dataKey="infaq" name="Infaq" fill="#3B82F6" />
                        <Bar dataKey="shodaqoh" name="Shodaqoh" fill="#F59E0B" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <Select value={filterMonth.toString()} onValueChange={(v) => setFilterMonth(parseInt(v))}>
                    <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {monthNames.map((m, i) => (
                            <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterYear.toString()} onValueChange={(v) => setFilterYear(parseInt(v))}>
                    <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[2024, 2025, 2026, 2027].map((y) => (
                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th className="text-left text-xs text-slate-400 p-4">Tanggal</th>
                            <th className="text-left text-xs text-slate-400 p-4">Jenis</th>
                            <th className="text-left text-xs text-slate-400 p-4">Donatur</th>
                            <th className="text-right text-xs text-slate-400 p-4">Jumlah</th>
                            <th className="text-left text-xs text-slate-400 p-4">Keterangan</th>
                            <th className="text-center text-xs text-slate-400 p-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-500">Belum ada data untuk periode ini</td>
                            </tr>
                        ) : (
                            reports.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/30">
                                    <td className="p-4 text-sm text-white">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'zakat' ? 'bg-emerald-900/50 text-emerald-400' : item.type === 'infaq' ? 'bg-blue-900/50 text-blue-400' : 'bg-amber-900/50 text-amber-400'}`}>
                                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-300">{item.donor_name || '-'}</td>
                                    <td className="p-4 text-sm text-white text-right font-mono">{formatCurrency(item.amount)}</td>
                                    <td className="p-4 text-sm text-slate-400 max-w-xs truncate">{item.description || '-'}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-slate-400 hover:text-white">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Dialog Form */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Laporan ZIS' : 'Tambah Laporan ZIS'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Jenis *</label>
                            <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ZIS_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Jumlah (Rp) *</label>
                            <Input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} className="bg-slate-800 border-slate-700" placeholder="100000" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Tanggal *</label>
                            <Input type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} className="bg-slate-800 border-slate-700" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Nama Donatur (opsional)</label>
                            <Input value={formData.donor_name} onChange={(e) => setFormData(p => ({ ...p, donor_name: e.target.value }))} className="bg-slate-800 border-slate-700" placeholder="Hamba Allah" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Keterangan</label>
                            <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="bg-slate-800 border-slate-700" rows={2} placeholder="Keterangan tambahan..." />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600">Batal</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
