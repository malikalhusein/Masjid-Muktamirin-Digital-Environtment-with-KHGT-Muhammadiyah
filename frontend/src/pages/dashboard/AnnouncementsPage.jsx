import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, Edit2, AlertCircle, Megaphone, CheckCircle } from 'lucide-react';
import { announcementAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'umum', label: 'Umum', icon: Bell },
    { value: 'penting', label: 'Penting', icon: AlertCircle },
    { value: 'kegiatan', label: 'Kegiatan', icon: Megaphone },
];

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'umum',
        is_active: true,
        priority: 0
    });

    const fetchData = useCallback(async () => {
        try {
            const res = await announcementAPI.getAll();
            setAnnouncements(res.data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Gagal memuat pengumuman');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error('Judul dan isi pengumuman harus diisi');
            return;
        }

        try {
            if (editingItem) {
                await announcementAPI.update(editingItem.id, formData);
                toast.success('Pengumuman berhasil diperbarui');
            } else {
                await announcementAPI.create(formData);
                toast.success('Pengumuman berhasil ditambahkan');
            }
            setDialogOpen(false);
            setEditingItem(null);
            setFormData({ title: '', content: '', category: 'umum', is_active: true, priority: 0 });
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan pengumuman');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            category: item.category,
            is_active: item.is_active,
            priority: item.priority
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
        try {
            await announcementAPI.delete(id);
            toast.success('Pengumuman berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus pengumuman');
        }
    };

    const handleToggleActive = async (item) => {
        try {
            await announcementAPI.update(item.id, { is_active: !item.is_active });
            toast.success(item.is_active ? 'Pengumuman dinonaktifkan' : 'Pengumuman diaktifkan');
            fetchData();
        } catch (error) {
            toast.error('Gagal mengubah status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="announcements-page">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Bell className="w-7 h-7 text-amber-400" />
                        Pengumuman
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Kelola pengumuman untuk website masjid</p>
                </div>
                <Button 
                    onClick={() => { 
                        setEditingItem(null); 
                        setFormData({ title: '', content: '', category: 'umum', is_active: true, priority: 0 }); 
                        setDialogOpen(true); 
                    }} 
                    className="bg-amber-600 hover:bg-amber-700"
                    data-testid="add-announcement-btn"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Pengumuman
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">Total Pengumuman</p>
                    <p className="text-2xl font-bold text-white">{announcements.length}</p>
                </div>
                <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl p-4">
                    <p className="text-emerald-400 text-sm">Aktif</p>
                    <p className="text-2xl font-bold text-white">{announcements.filter(a => a.is_active).length}</p>
                </div>
                <div className="bg-amber-900/30 border border-amber-800 rounded-xl p-4">
                    <p className="text-amber-400 text-sm">Penting</p>
                    <p className="text-2xl font-bold text-white">{announcements.filter(a => a.category === 'penting').length}</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Belum ada pengumuman</p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div 
                            key={item.id} 
                            className={`bg-slate-800/50 border rounded-xl p-4 ${item.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            item.category === 'penting' ? 'bg-red-900/50 text-red-400' :
                                            item.category === 'kegiatan' ? 'bg-blue-900/50 text-blue-400' :
                                            'bg-slate-700 text-slate-300'
                                        }`}>
                                            {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                                        </span>
                                        {item.priority > 0 && (
                                            <span className="text-xs text-amber-400">Prioritas: {item.priority}</span>
                                        )}
                                        {item.is_active && (
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                                    <p className="text-slate-400 text-sm line-clamp-2">{item.content}</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <Switch 
                                        checked={item.is_active} 
                                        onCheckedChange={() => handleToggleActive(item)}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-slate-400 hover:text-white">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Dialog Form */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Judul *</label>
                            <Input 
                                value={formData.title} 
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} 
                                className="bg-slate-800 border-slate-700" 
                                placeholder="Judul pengumuman"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Isi Pengumuman *</label>
                            <Textarea 
                                value={formData.content} 
                                onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} 
                                className="bg-slate-800 border-slate-700" 
                                rows={4}
                                placeholder="Isi pengumuman..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Kategori</label>
                                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Prioritas</label>
                                <Input 
                                    type="number" 
                                    value={formData.priority} 
                                    onChange={(e) => setFormData(p => ({ ...p, priority: parseInt(e.target.value) || 0 }))} 
                                    className="bg-slate-800 border-slate-700"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch 
                                checked={formData.is_active} 
                                onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))}
                            />
                            <label className="text-sm text-slate-300">Aktif</label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600">Batal</Button>
                            <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
