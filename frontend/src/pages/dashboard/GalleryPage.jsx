import { useState, useEffect, useCallback } from 'react';
import { ImageIcon, Plus, Trash2, Edit2 } from 'lucide-react';
import { galleryAPI, uploadAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const GALLERY_CATEGORIES = [
    { value: 'umum', label: 'Umum' },
    { value: 'ramadan', label: 'Khusus Ramadan' },
    { value: 'idulfitri', label: 'Idulfitri' },
];

export default function GalleryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        description: '',
        event_date: '',
        category: 'umum',
        order: 0,
        is_active: true
    });

    const fetchData = useCallback(async () => {
        try {
            const res = await galleryAPI.getAll();
            setItems(res.data);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            toast.error('Gagal memuat galeri');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.image_url) {
            toast.error('Judul dan gambar harus diisi');
            return;
        }

        try {
            if (editingItem) {
                await galleryAPI.update(editingItem.id, formData);
                toast.success('Foto berhasil diperbarui');
            } else {
                await galleryAPI.create(formData);
                toast.success('Foto berhasil ditambahkan');
            }
            setDialogOpen(false);
            setEditingItem(null);
            setFormData({ title: '', image_url: '', description: '', event_date: '', category: 'umum', order: 0, is_active: true });
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan foto');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            image_url: item.image_url,
            description: item.description || '',
            event_date: item.event_date || '',
            category: item.category || 'umum',
            order: item.order,
            is_active: item.is_active
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus foto ini?')) return;
        try {
            await galleryAPI.delete(id);
            toast.success('Foto berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus foto');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="gallery-page">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ImageIcon className="w-7 h-7 text-cyan-400" />
                        Galeri Foto
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Kelola galeri foto kegiatan masjid</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({ title: '', image_url: '', description: '', event_date: '', category: 'umum', order: items.length, is_active: true });
                        setDialogOpen(true);
                    }}
                    className="bg-cyan-600 hover:bg-cyan-700"
                    data-testid="add-gallery-btn"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Foto
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.length === 0 ? (
                    <div className="col-span-full bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Belum ada foto</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className={`group relative bg-slate-800/50 border rounded-xl overflow-hidden ${item.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}
                        >
                            <img src={item.image_url} alt={item.title} className="w-full aspect-square object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                                    {item.event_date && (
                                        <p className="text-slate-400 text-xs">{new Date(item.event_date).toLocaleDateString('id-ID')}</p>
                                    )}
                                    <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-medium ${item.category === 'ramadan' ? 'bg-amber-500/30 text-amber-300' :
                                            item.category === 'idulfitri' ? 'bg-green-500/30 text-green-300' :
                                                'bg-slate-500/30 text-slate-300'
                                        }`}>
                                        {GALLERY_CATEGORIES.find(c => c.value === item.category)?.label || 'Umum'}
                                    </span>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="bg-black/50 text-white hover:bg-white hover:text-black h-8 w-8">
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="bg-black/50 text-white hover:bg-red-500 h-8 w-8">
                                        <Trash2 className="w-3 h-3" />
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
                        <DialogTitle>{editingItem ? 'Edit Foto' : 'Tambah Foto'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Judul *</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                className="bg-slate-800 border-slate-700"
                                placeholder="Kegiatan Tarawih 1447 H"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Gambar *</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="bg-slate-800 border-slate-700"
                            />
                            {formData.image_url && (
                                <img src={formData.image_url} alt="Preview" className="w-full max-h-48 object-cover rounded mt-2" />
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Deskripsi</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                className="bg-slate-800 border-slate-700"
                                rows={2}
                                placeholder="Deskripsi singkat..."
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Kategori</label>
                            <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {GALLERY_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Tanggal Kegiatan</label>
                                <Input
                                    type="date"
                                    value={formData.event_date}
                                    onChange={(e) => setFormData(p => ({ ...p, event_date: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Urutan</label>
                                <Input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
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
                            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
