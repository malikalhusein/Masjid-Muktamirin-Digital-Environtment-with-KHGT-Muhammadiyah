import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { pengurusAPI, uploadAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

export default function PengurusPage({ isEmbedded = false }) {
    const [pengurus, setPengurus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        period: '2024-2027',
        photo_url: '',
        phone: '',
        order: 0,
        is_active: true
    });

    const fetchData = useCallback(async () => {
        try {
            const res = await pengurusAPI.getAll();
            setPengurus(res.data);
        } catch (error) {
            console.error('Error fetching pengurus:', error);
            toast.error('Gagal memuat data pengurus');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.position) {
            toast.error('Nama dan jabatan harus diisi');
            return;
        }

        try {
            if (editingItem) {
                await pengurusAPI.update(editingItem.id, formData);
                toast.success('Data pengurus berhasil diperbarui');
            } else {
                await pengurusAPI.create(formData);
                toast.success('Pengurus berhasil ditambahkan');
            }
            setDialogOpen(false);
            setEditingItem(null);
            setFormData({ name: '', position: '', period: '2024-2027', photo_url: '', phone: '', order: 0, is_active: true });
            fetchData();
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('Hanya admin yang dapat mengelola pengurus');
            } else {
                toast.error('Gagal menyimpan data pengurus');
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            position: item.position,
            period: item.period,
            photo_url: item.photo_url || '',
            phone: item.phone || '',
            order: item.order,
            is_active: item.is_active
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus pengurus ini?')) return;
        try {
            await pengurusAPI.delete(id);
            toast.success('Pengurus berhasil dihapus');
            fetchData();
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('Hanya admin yang dapat menghapus pengurus');
            } else {
                toast.error('Gagal menghapus pengurus');
            }
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await uploadAPI.upload(file);
            setFormData(p => ({ ...p, photo_url: res.data.url }));
            toast.success('Foto berhasil diupload');
        } catch (error) {
            toast.error('Gagal upload foto');
        }
    };

    const POSITIONS = [
        'Ketua Takmir',
        'Wakil Ketua',
        'Sekretaris',
        'Bendahara',
        'Sie. Dakwah',
        'Sie. Pemuda',
        'Sie. Kebersihan',
        'Sie. Keamanan',
        'Anggota'
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="pengurus-page">
            {/* Header */}
            <div className="flex items-center justify-between">
                {!isEmbedded ? (
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Users className="w-7 h-7 text-purple-400" />
                            Struktur Pengurus
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Kelola struktur pengurus takmir masjid</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="font-heading text-lg text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-400" /> Daftar Pengurus
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Kelola personil takmir</p>
                    </div>
                )}
                <Button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({ name: '', position: '', period: '2024-2027', photo_url: '', phone: '', order: pengurus.length, is_active: true });
                        setDialogOpen(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="add-pengurus-btn"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Pengurus
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pengurus.length === 0 ? (
                    <div className="col-span-full bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Belum ada data pengurus</p>
                    </div>
                ) : (
                    pengurus.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-slate-800/50 border rounded-xl p-4 ${item.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {item.photo_url ? (
                                        <img src={item.photo_url} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center">
                                            <span className="text-lg font-bold text-purple-400">{item.name[0]}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-slate-400 hover:text-white h-8 w-8">
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-400 h-8 w-8">
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-white">{item.name}</h3>
                            <p className="text-purple-400 text-sm">{item.position}</p>
                            <p className="text-slate-500 text-xs mt-1">Periode {item.period}</p>
                            {item.phone && (
                                <p className="text-slate-400 text-xs mt-1">{item.phone}</p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Dialog Form */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Pengurus' : 'Tambah Pengurus'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Nama Lengkap *</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                className="bg-slate-800 border-slate-700"
                                placeholder="Nama lengkap"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Jabatan *</label>
                            <Input
                                value={formData.position}
                                onChange={(e) => setFormData(p => ({ ...p, position: e.target.value }))}
                                className="bg-slate-800 border-slate-700"
                                placeholder="Ketua Takmir"
                                list="positions"
                            />
                            <datalist id="positions">
                                {POSITIONS.map(p => <option key={p} value={p} />)}
                            </datalist>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Periode</label>
                                <Input
                                    value={formData.period}
                                    onChange={(e) => setFormData(p => ({ ...p, period: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                    placeholder="2024-2027"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">No. HP</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                    className="bg-slate-800 border-slate-700"
                                    placeholder="08xxx"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Foto (opsional)</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="bg-slate-800 border-slate-700"
                            />
                            {formData.photo_url && (
                                <img src={formData.photo_url} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />
                            )}
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
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
