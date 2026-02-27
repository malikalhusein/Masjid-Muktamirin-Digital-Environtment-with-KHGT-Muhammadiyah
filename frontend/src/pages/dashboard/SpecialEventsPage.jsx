import { useState, useEffect, useCallback } from 'react';
import { CalendarHeart, Plus, Trash2, Edit2, Calendar, MapPin, User, Mic } from 'lucide-react';
import { specialEventAPI, uploadAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const EVENT_CATEGORIES = [
    { value: 'nuzulul_quran', label: 'Nuzulul Quran' },
    { value: 'khatmil_quran', label: 'Khatmil Quran' },
    { value: 'syawalan', label: 'Halal Bihalal / Syawalan' },
    { value: 'isra_miraj', label: 'Isra Miraj' },
    { value: 'maulid', label: 'Maulid Nabi' },
    { value: 'tahun_baru_islam', label: 'Tahun Baru Islam' },
    { value: 'hari_raya', label: 'Hari Raya' },
    { value: 'pengajian', label: 'Pengajian Akbar' },
    { value: 'kegiatan', label: 'Kegiatan Lainnya' },
];

export default function SpecialEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: 'Masjid Muktamirin',
        category: 'kegiatan',
        imam: '',
        speaker: '',
        image_url: '',
        is_active: true
    });

    const fetchData = useCallback(async () => {
        try {
            const res = await specialEventAPI.getAll();
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Gagal memuat data event');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.event_date) {
            toast.error('Judul dan tanggal harus diisi');
            return;
        }

        try {
            if (editingItem) {
                await specialEventAPI.update(editingItem.id, formData);
                toast.success('Event berhasil diperbarui');
            } else {
                await specialEventAPI.create(formData);
                toast.success('Event berhasil ditambahkan');
            }
            setDialogOpen(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan event');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            event_date: '',
            event_time: '',
            location: 'Masjid Muktamirin',
            category: 'kegiatan',
            imam: '',
            speaker: '',
            image_url: '',
            is_active: true
        });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            event_date: item.event_date,
            event_time: item.event_time || '',
            location: item.location,
            category: item.category,
            imam: item.imam || '',
            speaker: item.speaker || '',
            image_url: item.image_url || '',
            is_active: item.is_active
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus event ini?')) return;
        try {
            await specialEventAPI.delete(id);
            toast.success('Event berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus event');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await uploadAPI.upload(file);
            setFormData(p => ({ ...p, image_url: res.data.url }));
            toast.success('Gambar berhasil diupload');
        } catch (error) {
            toast.error('Gagal upload gambar');
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const isUpcoming = (dateStr) => {
        return new Date(dateStr) >= new Date(new Date().toDateString());
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="special-events-page">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <CalendarHeart className="w-7 h-7 text-rose-400" />
                        Agenda
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Kelola agenda kegiatan masjid (Pengajian, Nuzulul Quran, dll)</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingItem(null);
                        resetForm();
                        setDialogOpen(true);
                    }}
                    className="bg-rose-600 hover:bg-rose-700"
                    data-testid="add-event-btn"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Agenda
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">Total Agenda</p>
                    <p className="text-2xl font-bold text-white">{events.length}</p>
                </div>
                <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl p-4">
                    <p className="text-emerald-400 text-sm">Agenda Mendatang</p>
                    <p className="text-2xl font-bold text-white">{events.filter(e => isUpcoming(e.event_date)).length}</p>
                </div>
                <div className="bg-rose-900/30 border border-rose-800 rounded-xl p-4">
                    <p className="text-rose-400 text-sm">Aktif</p>
                    <p className="text-2xl font-bold text-white">{events.filter(e => e.is_active).length}</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <CalendarHeart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Belum ada agenda</p>
                    </div>
                ) : (
                    events.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-slate-800/50 border rounded-xl p-4 ${item.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}
                        >
                            <div className="flex gap-4">
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.title} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${isUpcoming(item.event_date) ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                                {EVENT_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                                            </span>
                                            <h3 className="text-lg font-semibold text-white mt-2">{item.title}</h3>
                                            {item.description && (
                                                <p className="text-slate-400 text-sm line-clamp-2 mt-1">{item.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-slate-400 hover:text-white h-8 w-8">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-400 h-8 w-8">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                        <span className="flex items-center gap-1 text-slate-300">
                                            <Calendar className="w-4 h-4 text-rose-400" />
                                            {formatDate(item.event_date)} {item.event_time && `• ${item.event_time}`}
                                        </span>
                                        <span className="flex items-center gap-1 text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                            {item.location}
                                        </span>
                                        {item.imam && (
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <User className="w-4 h-4" />
                                                Imam: {item.imam}
                                            </span>
                                        )}
                                        {item.speaker && (
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <Mic className="w-4 h-4" />
                                                Penceramah: {item.speaker}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Dialog Form */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Agenda' : 'Tambah Agenda'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm text-slate-400 mb-1 block">Judul Agenda *</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                    placeholder="Nuzulul Quran 1447 H"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Kategori</label>
                                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EVENT_CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Lokasi</label>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                    placeholder="Masjid Muktamirin"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Tanggal *</label>
                                <Input
                                    type="date"
                                    value={formData.event_date}
                                    onChange={(e) => setFormData(p => ({ ...p, event_date: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Waktu</label>
                                <Input
                                    type="time"
                                    value={formData.event_time}
                                    onChange={(e) => setFormData(p => ({ ...p, event_time: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Imam</label>
                                <Input
                                    value={formData.imam}
                                    onChange={(e) => setFormData(p => ({ ...p, imam: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                    placeholder="Nama imam"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Penceramah</label>
                                <Input
                                    value={formData.speaker}
                                    onChange={(e) => setFormData(p => ({ ...p, speaker: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                    placeholder="Nama penceramah"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm text-slate-400 mb-1 block">Deskripsi</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                    rows={3}
                                    placeholder="Deskripsi agenda..."
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Gambar (opsional)</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                            <div className="flex items-end pb-2">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))}
                                    />
                                    <label className="text-sm text-slate-300">Aktif</label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600">Batal</Button>
                            <Button type="submit" className="bg-rose-600 hover:bg-rose-700">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
