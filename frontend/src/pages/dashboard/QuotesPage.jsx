import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Quote } from 'lucide-react';
import { quoteAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

export default function QuotesPage() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        arabic_text: '',
        translation: '',
        source: '',
        is_active: true,
        order: 0
    });

    const fetchData = useCallback(async () => {
        try {
            const res = await quoteAPI.getAll();
            setQuotes(res.data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
            toast.error('Gagal memuat quote');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.translation || !formData.source) {
            toast.error('Terjemahan dan sumber harus diisi');
            return;
        }

        try {
            if (editingItem) {
                await quoteAPI.update(editingItem.id, formData);
                toast.success('Quote berhasil diperbarui');
            } else {
                await quoteAPI.create(formData);
                toast.success('Quote berhasil ditambahkan');
            }
            setDialogOpen(false);
            setEditingItem(null);
            setFormData({ arabic_text: '', translation: '', source: '', is_active: true, order: 0 });
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan quote');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            arabic_text: item.arabic_text || '',
            translation: item.translation,
            source: item.source,
            is_active: item.is_active,
            order: item.order
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus quote ini?')) return;
        try {
            await quoteAPI.delete(id);
            toast.success('Quote berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus quote');
        }
    };

    const handleToggleActive = async (item) => {
        try {
            await quoteAPI.update(item.id, { is_active: !item.is_active });
            toast.success(item.is_active ? 'Quote dinonaktifkan' : 'Quote diaktifkan');
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
        <div className="space-y-6" data-testid="quotes-page">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="w-7 h-7 text-teal-400" />
                        Quote Islami
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Kelola quote/hadits untuk ditampilkan di homepage</p>
                </div>
                <Button 
                    onClick={() => { 
                        setEditingItem(null); 
                        setFormData({ arabic_text: '', translation: '', source: '', is_active: true, order: quotes.length }); 
                        setDialogOpen(true); 
                    }} 
                    className="bg-teal-600 hover:bg-teal-700"
                    data-testid="add-quote-btn"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Quote
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">Total Quote</p>
                    <p className="text-2xl font-bold text-white">{quotes.length}</p>
                </div>
                <div className="bg-teal-900/30 border border-teal-800 rounded-xl p-4">
                    <p className="text-teal-400 text-sm">Aktif</p>
                    <p className="text-2xl font-bold text-white">{quotes.filter(q => q.is_active).length}</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {quotes.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Belum ada quote</p>
                    </div>
                ) : (
                    quotes.map((item) => (
                        <div 
                            key={item.id} 
                            className={`bg-slate-800/50 border rounded-xl p-5 ${item.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <Quote className="w-8 h-8 text-teal-400/30 mb-2" />
                                    {item.arabic_text && (
                                        <p className="text-xl text-right font-arabic text-teal-300 mb-3 leading-loose">{item.arabic_text}</p>
                                    )}
                                    <p className="text-white text-lg italic leading-relaxed">"{item.translation}"</p>
                                    <p className="text-teal-400 text-sm mt-3 font-medium">— {item.source}</p>
                                </div>
                                <div className="flex items-center gap-2">
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
                        <DialogTitle>{editingItem ? 'Edit Quote' : 'Tambah Quote'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Teks Arab (opsional)</label>
                            <Textarea 
                                value={formData.arabic_text} 
                                onChange={(e) => setFormData(p => ({ ...p, arabic_text: e.target.value }))} 
                                className="bg-slate-800 border-slate-700 text-right font-arabic text-lg" 
                                rows={2}
                                placeholder="مَنْ كَانَ يُؤْمِنُ بِاللهِ..."
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Terjemahan / Quote *</label>
                            <Textarea 
                                value={formData.translation} 
                                onChange={(e) => setFormData(p => ({ ...p, translation: e.target.value }))} 
                                className="bg-slate-800 border-slate-700" 
                                rows={3}
                                placeholder="Barangsiapa beriman kepada Allah dan hari akhir..."
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Sumber *</label>
                            <Input 
                                value={formData.source} 
                                onChange={(e) => setFormData(p => ({ ...p, source: e.target.value }))} 
                                className="bg-slate-800 border-slate-700" 
                                placeholder="HR. Bukhari no. 6018"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
