import { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, Trash2, Edit2, TrendingUp, DollarSign, Heart, RefreshCw, Sheet, CheckCircle, AlertCircle, ArrowDownCircle, ArrowUpCircle, Copy, ExternalLink } from 'lucide-react';
import { zisAPI, expenditureAPI, sheetsAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import QRISSettingsPage from './QRISSettingsPage';

const ZIS_TYPES = [
    { value: 'zakat', label: 'Zakat', color: 'emerald' },
    { value: 'infaq', label: 'Infaq', color: 'blue' },
    { value: 'shodaqoh', label: 'Shodaqoh', color: 'amber' },
];

const EXPENDITURE_CATEGORIES = [
    { value: 'operasional', label: 'Operasional', icon: '⚙️' },
    { value: 'pembangunan', label: 'Pembangunan & Renovasi', icon: '🏗️' },
    { value: 'dakwah', label: 'Dakwah & Pendidikan', icon: '📖' },
    { value: 'sosial', label: 'Sosial & Kemasyarakatan', icon: '🤲' },
    { value: 'lainnya', label: 'Lainnya', icon: '📋' },
];

const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// ─── Komponen: Tab Pemasukan ZIS ─────────────────────────────────────────────
function PemasukanTab() {
    const [reports, setReports] = useState([]);
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const emptyForm = { type: 'infaq', amount: '', description: '', date: new Date().toISOString().split('T')[0], donor_name: '' };
    const [formData, setFormData] = useState(emptyForm);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [rRes, sRes, cRes] = await Promise.all([
                zisAPI.getAll(filterMonth, filterYear),
                zisAPI.getSummary(filterMonth, filterYear),
                zisAPI.getMonthlyChart(filterYear),
            ]);
            setReports(rRes.data);
            setSummary(sRes.data);
            setChartData(cRes.data);
        } catch { toast.error('Gagal memuat data ZIS'); }
        finally { setLoading(false); }
    }, [filterMonth, filterYear]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.date) { toast.error('Jumlah dan tanggal harus diisi'); return; }
        try {
            const data = { ...formData, amount: parseFloat(formData.amount) };
            if (editingItem) { await zisAPI.update(editingItem.id, data); toast.success('Berhasil diperbarui'); }
            else { await zisAPI.create(data); toast.success('Berhasil ditambahkan'); }
            setDialogOpen(false); setEditingItem(null); setFormData(emptyForm); fetchData();
        } catch { toast.error('Gagal menyimpan'); }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({ type: item.type, amount: item.amount.toString(), description: item.description || '', date: item.date, donor_name: item.donor_name || '' });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin hapus laporan ini?')) return;
        try { await zisAPI.delete(id); toast.success('Dihapus'); fetchData(); }
        catch { toast.error('Gagal menghapus'); }
    };

    if (loading) return <div className="flex justify-center h-40 items-center"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-white font-semibold">Pemasukan ZIS</span>
                </div>
                <Button onClick={() => { setEditingItem(null); setFormData(emptyForm); setDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Tambah Pemasukan
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Zakat', key: 'zakat', icon: <DollarSign className="w-4 h-4" />, cls: 'bg-emerald-900/30 border-emerald-800 text-emerald-400' },
                    { label: 'Infaq', key: 'infaq', icon: <Heart className="w-4 h-4" />, cls: 'bg-blue-900/30 border-blue-800 text-blue-400' },
                    { label: 'Shodaqoh', key: 'shodaqoh', icon: <Heart className="w-4 h-4" />, cls: 'bg-amber-900/30 border-amber-800 text-amber-400' },
                    { label: `Total ${monthNames[filterMonth - 1]}`, key: 'grand', icon: <TrendingUp className="w-4 h-4" />, cls: 'bg-slate-800 border-slate-600 text-white' },
                ].map(({ label, key, icon, cls }) => (
                    <div key={key} className={`border rounded-xl p-4 ${cls}`}>
                        <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs opacity-80">{label}</span></div>
                        <p className="text-xl font-bold">{formatCurrency(key === 'grand' ? summary?.grand_total : summary?.[key]?.total)}</p>
                        {key !== 'grand' && <p className="text-xs opacity-60">{summary?.[key]?.count || 0} transaksi</p>}
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Grafik ZIS {filterYear}</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                        <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="zakat" name="Zakat" fill="#10B981" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="infaq" name="Infaq" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="shodaqoh" name="Shodaqoh" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Filter */}
            <div className="flex gap-3">
                <Select value={filterMonth.toString()} onValueChange={(v) => setFilterMonth(parseInt(v))}>
                    <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterYear.toString()} onValueChange={(v) => setFilterYear(parseInt(v))}>
                    <SelectTrigger className="w-28 bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
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
                            <th className="text-right text-xs text-emerald-400 p-4">Jumlah</th>
                            <th className="text-left text-xs text-slate-400 p-4">Keterangan</th>
                            <th className="text-center text-xs text-slate-400 p-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {reports.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-slate-500">Belum ada data pemasukan untuk periode ini</td></tr>
                        ) : reports.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30">
                                <td className="p-4 text-sm text-white">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'zakat' ? 'bg-emerald-900/50 text-emerald-400' : item.type === 'infaq' ? 'bg-blue-900/50 text-blue-400' : 'bg-amber-900/50 text-amber-400'}`}>
                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-300">{item.donor_name || 'Anonim'}</td>
                                <td className="p-4 text-sm text-emerald-400 text-right font-mono font-semibold">{formatCurrency(item.amount)}</td>
                                <td className="p-4 text-sm text-slate-400 max-w-xs truncate">{item.description || '-'}</td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-slate-400 hover:text-white w-8 h-8"><Edit2 className="w-3.5 h-3.5" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-400 w-8 h-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader><DialogTitle>{editingItem ? 'Edit Pemasukan ZIS' : 'Tambah Pemasukan ZIS'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Jenis *</label>
                            <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                                <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent>{ZIS_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
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
                            <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="bg-slate-800 border-slate-700" rows={2} />
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

// ─── Komponen: Tab Pengeluaran Dana ──────────────────────────────────────────
function PengeluaranTab() {
    const [reports, setReports] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const emptyForm = { category: 'operasional', amount: '', description: '', date: new Date().toISOString().split('T')[0] };
    const [formData, setFormData] = useState(emptyForm);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [rRes, sRes] = await Promise.all([
                expenditureAPI.getAll(filterMonth, filterYear),
                expenditureAPI.getSummary(filterMonth, filterYear),
            ]);
            setReports(rRes.data);
            setSummary(sRes.data);
        } catch { toast.error('Gagal memuat data pengeluaran'); }
        finally { setLoading(false); }
    }, [filterMonth, filterYear]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.date) { toast.error('Jumlah dan tanggal harus diisi'); return; }
        try {
            const data = { ...formData, amount: parseFloat(formData.amount) };
            if (editingItem) { await expenditureAPI.update(editingItem.id, data); toast.success('Berhasil diperbarui'); }
            else { await expenditureAPI.create(data); toast.success('Pengeluaran berhasil dicatat'); }
            setDialogOpen(false); setEditingItem(null); setFormData(emptyForm); fetchData();
        } catch { toast.error('Gagal menyimpan'); }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({ category: item.category, amount: item.amount.toString(), description: item.description || '', date: item.date });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin hapus data pengeluaran ini?')) return;
        try { await expenditureAPI.delete(id); toast.success('Dihapus'); fetchData(); }
        catch { toast.error('Gagal menghapus'); }
    };

    const getCatLabel = (val) => EXPENDITURE_CATEGORIES.find(c => c.value === val)?.label || val;
    const getCatIcon = (val) => EXPENDITURE_CATEGORIES.find(c => c.value === val)?.icon || '📋';

    if (loading) return <div className="flex justify-center h-40 items-center"><div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ArrowUpCircle className="w-5 h-5 text-red-400" />
                    <span className="text-white font-semibold">Pengeluaran Dana</span>
                </div>
                <Button onClick={() => { setEditingItem(null); setFormData(emptyForm); setDialogOpen(true); }} className="bg-red-700 hover:bg-red-800" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Tambah Pengeluaran
                </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {EXPENDITURE_CATEGORIES.map(cat => {
                    const data = summary?.categories?.[cat.value];
                    if (!data) return null;
                    return (
                        <div key={cat.value} className="bg-red-900/20 border border-red-900/40 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span>{cat.icon}</span>
                                <span className="text-xs text-red-300">{cat.label}</span>
                            </div>
                            <p className="text-lg font-bold text-red-400">{formatCurrency(data.total)}</p>
                            <p className="text-xs text-slate-500">{data.count} entri</p>
                        </div>
                    );
                })}
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-white" />
                        <span className="text-xs text-slate-400">Total {monthNames[filterMonth - 1]}</span>
                    </div>
                    <p className="text-lg font-bold text-white">{formatCurrency(summary?.grand_total)}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-3">
                <Select value={filterMonth.toString()} onValueChange={(v) => setFilterMonth(parseInt(v))}>
                    <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterYear.toString()} onValueChange={(v) => setFilterYear(parseInt(v))}>
                    <SelectTrigger className="w-28 bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th className="text-left text-xs text-slate-400 p-4">Tanggal</th>
                            <th className="text-left text-xs text-slate-400 p-4">Kategori</th>
                            <th className="text-right text-xs text-red-400 p-4">Jumlah</th>
                            <th className="text-left text-xs text-slate-400 p-4">Keterangan</th>
                            <th className="text-center text-xs text-slate-400 p-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {reports.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-10 text-slate-500">Belum ada data pengeluaran untuk periode ini</td></tr>
                        ) : reports.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30">
                                <td className="p-4 text-sm text-white">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-900/30 text-red-300">
                                        {getCatIcon(item.category)} {getCatLabel(item.category)}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-red-400 text-right font-mono font-semibold">{formatCurrency(item.amount)}</td>
                                <td className="p-4 text-sm text-slate-400 max-w-xs truncate">{item.description || '-'}</td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-slate-400 hover:text-white w-8 h-8"><Edit2 className="w-3.5 h-3.5" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-400 w-8 h-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader><DialogTitle>{editingItem ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Dana'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Kategori *</label>
                            <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                                <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {EXPENDITURE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Jumlah (Rp) *</label>
                            <Input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} className="bg-slate-800 border-slate-700" placeholder="500000" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Tanggal *</label>
                            <Input type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} className="bg-slate-800 border-slate-700" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Keterangan pengeluaran</label>
                            <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="bg-slate-800 border-slate-700" rows={3} placeholder="Digunakan untuk..." />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600">Batal</Button>
                            <Button type="submit" className="bg-red-700 hover:bg-red-800">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Komponen: Tab Google Sheets ──────────────────────────────────────────────
function GoogleSheetsTab() {
    const [config, setConfig] = useState({ spreadsheet_id: '', has_credentials: false });
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [credJson, setCredJson] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        sheetsAPI.getConfig()
            .then(r => {
                setConfig(r.data);
                setSpreadsheetId(r.data.spreadsheet_id || '');
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = {};
            if (spreadsheetId) data.spreadsheet_id = spreadsheetId;
            if (credJson) data.service_account_json = credJson;
            await sheetsAPI.saveConfig(data);
            toast.success('Konfigurasi disimpan');
            setConfig(prev => ({ ...prev, spreadsheet_id: spreadsheetId, has_credentials: credJson ? true : prev.has_credentials }));
            setCredJson('');
        } catch { toast.error('Gagal menyimpan konfigurasi'); }
        finally { setSaving(false); }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const r = await sheetsAPI.sync();
            setSyncResult({ success: true, ...r.data });
            toast.success(`Sinkronisasi berhasil! ${r.data.zis_rows} baris ZIS, ${r.data.expenditure_rows} baris Pengeluaran`);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Gagal sinkronisasi';
            setSyncResult({ success: false, message: msg });
            toast.error(msg);
        } finally { setSyncing(false); }
    };

    if (loading) return <div className="flex justify-center h-40 items-center"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6">
            {/* Guide */}
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span>📋</span> Panduan Setup Google Sheets
                </h3>
                <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
                    <li>Buka <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a> → buat/pilih project</li>
                    <li>Aktifkan <strong>Google Sheets API</strong> dan <strong>Google Drive API</strong></li>
                    <li>Buat <strong>Service Account</strong> → download file <code className="bg-slate-800 px-1 rounded">credentials.json</code></li>
                    <li>Buat Google Spreadsheet baru → <strong>Share</strong> ke email Service Account (Editor)</li>
                    <li>Salin <strong>Spreadsheet ID</strong> dari URL: <code className="bg-slate-800 px-1 rounded text-xs">docs.google.com/spreadsheets/d/<span className="text-yellow-400">ID_DI_SINI</span>/edit</code></li>
                    <li>Tempel Spreadsheet ID dan isi konten credentials.json di bawah ini</li>
                </ol>
            </div>

            {/* Status */}
            <div className="flex gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm ${config.has_credentials ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {config.has_credentials ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    Credentials: {config.has_credentials ? 'Sudah dikonfigurasi' : 'Belum diatur'}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm ${config.spreadsheet_id ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {config.spreadsheet_id ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    Spreadsheet ID: {config.spreadsheet_id ? 'Tersimpan' : 'Belum diatur'}
                </div>
            </div>

            {/* Config Form */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
                <h4 className="text-white font-medium">Konfigurasi</h4>
                <div>
                    <label className="text-sm text-slate-400 mb-1 block">Spreadsheet ID</label>
                    <Input
                        value={spreadsheetId}
                        onChange={(e) => setSpreadsheetId(e.target.value)}
                        className="bg-slate-900 border-slate-600 text-white font-mono text-sm"
                        placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                    />
                </div>
                <div>
                    <label className="text-sm text-slate-400 mb-1 block">
                        Service Account Credentials (JSON)
                        {config.has_credentials && <span className="text-green-400 ml-2 text-xs">✓ Sudah ada — isi ulang hanya jika ingin mengganti</span>}
                    </label>
                    <Textarea
                        value={credJson}
                        onChange={(e) => setCredJson(e.target.value)}
                        className="bg-slate-900 border-slate-600 text-white font-mono text-xs"
                        rows={6}
                        placeholder={'{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "...",\n  ...\n}'}
                    />
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-slate-600 hover:bg-slate-500">
                    {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                </Button>
            </div>

            {/* Sync */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <h4 className="text-white font-medium mb-2">Sinkronisasi ke Google Sheets</h4>
                <p className="text-sm text-slate-400 mb-4">
                    Data Pemasukan ZIS dan Pengeluaran Dana akan disalin ke dua sheet terpisah: <strong className="text-white">"Pemasukan ZIS"</strong> dan <strong className="text-white">"Pengeluaran Dana"</strong>.
                </p>
                <Button
                    onClick={handleSync}
                    disabled={syncing || !config.spreadsheet_id || !config.has_credentials}
                    className="bg-green-700 hover:bg-green-600 disabled:opacity-50"
                >
                    {syncing ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Menyinkronkan...</> : <><RefreshCw className="w-4 h-4 mr-2" />Sync ke Google Sheets</>}
                </Button>

                {syncResult && (
                    <div className={`mt-4 p-4 rounded-lg border ${syncResult.success ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
                        {syncResult.success ? (
                            <div className="flex items-start gap-2 text-green-300">
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Sinkronisasi berhasil!</p>
                                    <p className="text-sm mt-1">{syncResult.zis_rows} baris pemasukan · {syncResult.expenditure_rows} baris pengeluaran</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2 text-red-300">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{syncResult.message}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main ZISPage ─────────────────────────────────────────────────────────────
export default function ZISPage() {
    return (
        <div className="space-y-6" data-testid="zis-page">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Wallet className="w-7 h-7 text-emerald-400" />
                        Laporan ZIS & Keuangan
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Kelola pemasukan ZIS, pengeluaran dana, dan sinkronisasi Google Sheets</p>
                </div>
            </div>

            <Tabs defaultValue="pemasukan" className="space-y-6">
                <TabsList className="bg-slate-800 h-auto p-1 flex flex-wrap gap-1">
                    <TabsTrigger value="pemasukan" className="data-[state=active]:bg-emerald-900 flex items-center gap-2">
                        <ArrowDownCircle className="w-4 h-4 text-emerald-400" /> Pemasukan ZIS
                    </TabsTrigger>
                    <TabsTrigger value="pengeluaran" className="data-[state=active]:bg-red-900 flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4 text-red-400" /> Pengeluaran Dana
                    </TabsTrigger>
                    <TabsTrigger value="sheets" className="data-[state=active]:bg-green-900 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-green-400" /> Google Sheets
                    </TabsTrigger>
                    <TabsTrigger value="qris" className="data-[state=active]:bg-amber-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-400" /> Pengaturan QRIS
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pemasukan">
                    <PemasukanTab />
                </TabsContent>

                <TabsContent value="pengeluaran">
                    <PengeluaranTab />
                </TabsContent>

                <TabsContent value="sheets">
                    <GoogleSheetsTab />
                </TabsContent>

                <TabsContent value="qris" className="m-0 border-none p-0">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
                        <QRISSettingsPage isEmbedded={true} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
