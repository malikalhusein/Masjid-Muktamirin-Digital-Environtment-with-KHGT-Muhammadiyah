import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Trash2, Edit2, Eye, Calendar } from 'lucide-react';
import { articleAPI, uploadAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'kegiatan', label: 'Kegiatan' },
    { value: 'pembangunan', label: 'Pembangunan' },
    { value: 'kajian', label: 'Kajian' },
    { value: 'pengumuman', label: 'Pengumuman' },
];

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: 'kegiatan',
        image_url: '',
        author: '',
        is_published: true
    });

    const fetchData = useCallback(async () => {
        try {
            const res = await articleAPI.getAll();
            setArticles(res.data);
        } catch (error) {
            console.error('Error fetching articles:', error);
            toast.error('Gagal memuat artikel');
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
            toast.error('Judul dan isi artikel harus diisi');
            return;
        }

        try {
            if (editingItem) {
                await articleAPI.update(editingItem.id, formData);
                toast.success('Artikel berhasil diperbarui');
            } else {
                await articleAPI.create(formData);
                toast.success('Artikel berhasil ditambahkan');
            }
            setDialogOpen(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan artikel');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            excerpt: '',
            category: 'kegiatan',
            image_url: '',
            author: '',
            is_published: true
        });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            excerpt: item.excerpt || '',
            category: item.category,
            image_url: item.image_url || '',
            author: item.author || '',
            is_published: item.is_published
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus artikel ini?')) return;
        try {
            await articleAPI.delete(id);
            toast.success('Artikel berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus artikel');
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
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="articles-page">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-7 h-7 text-indigo-400" />
                        Artikel Kegiatan
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Kelola artikel dan berita kegiatan masjid</p>
                </div>
                <Button 
                    onClick={() => { 
                        setEditingItem(null); 
                        resetForm();
                        setDialogOpen(true); 
                    }} 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    data-testid="add-article-btn"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Artikel
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">Total Artikel</p>
                    <p className="text-2xl font-bold text-white">{articles.length}</p>
                </div>
                <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl p-4">
                    <p className="text-emerald-400 text-sm">Published</p>
                    <p className="text-2xl font-bold text-white">{articles.filter(a => a.is_published).length}</p>
                </div>
                <div className="bg-indigo-900/30 border border-indigo-800 rounded-xl p-4">
                    <p className="text-indigo-400 text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-white">{articles.reduce((sum, a) => sum + (a.views || 0), 0)}</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {articles.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Belum ada artikel</p>
                    </div>
                ) : (
                    articles.map((item) => (
                        <div 
                            key={item.id} 
                            className={`bg-slate-800/50 border rounded-xl p-4 ${item.is_published ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}
                        >
                            <div className="flex gap-4">
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.title} className="w-32 h-24 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium bg-indigo-900/50 text-indigo-400`}>
                                                {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                                            </span>
                                            <h3 className="text-lg font-semibold text-white mt-2">{item.title}</h3>
                                            {item.excerpt && (
                                                <p className="text-slate-400 text-sm line-clamp-2 mt-1">{item.excerpt}</p>
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
                                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(item.created_at)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {item.views || 0} views
                                        </span>
                                        {item.author && <span>Oleh: {item.author}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Dialog Form */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Artikel' : 'Tambah Artikel'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Judul *</label>
                            <Input 
                                value={formData.title} 
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} 
                                className="bg-slate-800 border-slate-700" 
                                placeholder="Judul artikel"
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
                                <label className="text-sm text-slate-400 mb-1 block">Penulis</label>
                                <Input 
                                    value={formData.author} 
                                    onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))} 
                                    className="bg-slate-800 border-slate-700" 
                                    placeholder="Nama penulis"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Ringkasan (opsional)</label>
                            <Textarea 
                                value={formData.excerpt} 
                                onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))} 
                                className="bg-slate-800 border-slate-700" 
                                rows={2}
                                placeholder="Ringkasan singkat artikel..."
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Isi Artikel *</label>
                            <Textarea 
                                value={formData.content} 
                                onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} 
                                className="bg-slate-800 border-slate-700" 
                                rows={8}
                                placeholder="Isi artikel..."
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
                            {formData.image_url && (
                                <img src={formData.image_url} alt="Preview" className="w-full max-h-40 object-cover rounded mt-2" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch 
                                checked={formData.is_published} 
                                onCheckedChange={(v) => setFormData(p => ({ ...p, is_published: v }))}
                            />
                            <label className="text-sm text-slate-300">Published</label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600">Batal</Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
