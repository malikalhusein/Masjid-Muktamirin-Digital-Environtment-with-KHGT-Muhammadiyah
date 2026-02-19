import { useState, useEffect } from 'react';
import { Type, Plus, Trash2, Edit2, Save, Loader2, GripVertical } from 'lucide-react';
import { runningTextAPI } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';

export default function RunningTextPage() {
    const [texts, setTexts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        text: '',
        is_active: true,
        order: 0,
    });
    
    useEffect(() => {
        fetchTexts();
    }, []);
    
    const fetchTexts = async () => {
        try {
            const res = await runningTextAPI.getAll();
            setTexts(res.data);
        } catch (error) {
            console.error('Error fetching texts:', error);
            toast.error('Gagal memuat running text');
        } finally {
            setLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData({
            text: '',
            is_active: true,
            order: texts.length,
        });
        setEditingId(null);
    };
    
    const handleSubmit = async () => {
        if (!formData.text) {
            toast.error('Teks harus diisi');
            return;
        }
        
        setSaving(true);
        try {
            if (editingId) {
                await runningTextAPI.update(editingId, formData);
                toast.success('Running text berhasil diperbarui');
            } else {
                await runningTextAPI.create(formData);
                toast.success('Running text berhasil ditambahkan');
            }
            setDialogOpen(false);
            resetForm();
            fetchTexts();
        } catch (error) {
            console.error('Error saving text:', error);
            toast.error('Gagal menyimpan running text');
        } finally {
            setSaving(false);
        }
    };
    
    const handleEdit = (text) => {
        setFormData(text);
        setEditingId(text.id);
        setDialogOpen(true);
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus running text ini?')) return;
        
        try {
            await runningTextAPI.delete(id);
            toast.success('Running text berhasil dihapus');
            fetchTexts();
        } catch (error) {
            console.error('Error deleting text:', error);
            toast.error('Gagal menghapus running text');
        }
    };
    
    const handleToggleActive = async (text) => {
        try {
            await runningTextAPI.update(text.id, { is_active: !text.is_active });
            fetchTexts();
        } catch (error) {
            console.error('Error toggling text:', error);
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6" data-testid="running-text-page">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl text-white">Running Text</h1>
                    <p className="text-slate-400 font-body mt-1">
                        Kelola teks berjalan di bagian bawah layar TV
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-text-button">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Teks
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-xl text-white">
                                {editingId ? 'Edit Running Text' : 'Tambah Running Text'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Teks akan ditampilkan berjalan di bagian bawah layar TV
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Teks</Label>
                                <Input
                                    value={formData.text}
                                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                                    placeholder="Masukkan teks yang akan ditampilkan"
                                    className="bg-slate-800 border-slate-700 text-white"
                                    data-testid="text-input"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-slate-300">Urutan</Label>
                                <Input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    data-testid="text-order-input"
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-300">Aktif</Label>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                    data-testid="text-active-switch"
                                />
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-6">
                                <Button 
                                    variant="outline" 
                                    onClick={() => { setDialogOpen(false); resetForm(); }}
                                    className="border-slate-700"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    data-testid="save-text-button"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            {/* Preview */}
            {texts.filter(t => t.is_active).length > 0 && (
                <Card className="bg-emerald-900/30 border-emerald-800">
                    <CardContent className="p-4">
                        <p className="text-slate-400 text-sm mb-2">Preview Running Text:</p>
                        <p className="text-emerald-100 font-body">
                            {texts.filter(t => t.is_active).map(t => t.text).join('   •   ')}
                        </p>
                    </CardContent>
                </Card>
            )}
            
            {/* Text List */}
            {texts.length === 0 ? (
                <Card className="bg-slate-900/80 border-slate-800">
                    <CardContent className="py-12 text-center">
                        <Type className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Belum ada running text</p>
                        <p className="text-slate-500 text-sm">Klik tombol "Tambah Teks" untuk memulai</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {texts.map((text) => (
                        <Card key={text.id} className={`bg-slate-900/80 border-slate-800 ${!text.is_active ? 'opacity-50' : ''}`} data-testid={`text-card-${text.id}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <GripVertical className="w-5 h-5 text-slate-600 cursor-grab" />
                                    <span className="text-slate-500 text-sm w-8">#{text.order}</span>
                                    <p className="flex-1 text-white font-body">{text.text}</p>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={text.is_active}
                                            onCheckedChange={() => handleToggleActive(text)}
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="text-slate-400 hover:text-white"
                                            onClick={() => handleEdit(text)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="text-red-400 hover:text-red-300"
                                            onClick={() => handleDelete(text.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
