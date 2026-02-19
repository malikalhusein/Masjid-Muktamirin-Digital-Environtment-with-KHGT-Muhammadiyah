import { useState, useEffect } from 'react';
import { Image, Plus, Trash2, Edit2, Save, X, Upload, Loader2 } from 'lucide-react';
import { contentAPI, uploadAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';

export default function ContentPage() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        type: 'poster',
        title: '',
        content_url: '',
        text: '',
        duration: 10,
        is_active: true,
        order: 0,
    });
    
    useEffect(() => {
        fetchContents();
    }, []);
    
    const fetchContents = async () => {
        try {
            const res = await contentAPI.getAll();
            setContents(res.data);
        } catch (error) {
            console.error('Error fetching contents:', error);
            toast.error('Gagal memuat konten');
        } finally {
            setLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData({
            type: 'poster',
            title: '',
            content_url: '',
            text: '',
            duration: 10,
            is_active: true,
            order: 0,
        });
        setEditingId(null);
    };
    
    const handleSubmit = async () => {
        if (!formData.title) {
            toast.error('Judul harus diisi');
            return;
        }
        
        setSaving(true);
        try {
            if (editingId) {
                await contentAPI.update(editingId, formData);
                toast.success('Konten berhasil diperbarui');
            } else {
                await contentAPI.create(formData);
                toast.success('Konten berhasil ditambahkan');
            }
            setDialogOpen(false);
            resetForm();
            fetchContents();
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error('Gagal menyimpan konten');
        } finally {
            setSaving(false);
        }
    };
    
    const handleEdit = (content) => {
        setFormData(content);
        setEditingId(content.id);
        setDialogOpen(true);
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus konten ini?')) return;
        
        try {
            await contentAPI.delete(id);
            toast.success('Konten berhasil dihapus');
            fetchContents();
        } catch (error) {
            console.error('Error deleting content:', error);
            toast.error('Gagal menghapus konten');
        }
    };
    
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        try {
            const res = await uploadAPI.upload(file);
            setFormData(prev => ({ ...prev, content_url: res.data.url }));
            toast.success('File berhasil diunggah');
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Gagal mengunggah file');
        } finally {
            setUploading(false);
        }
    };
    
    const handleToggleActive = async (content) => {
        try {
            await contentAPI.update(content.id, { is_active: !content.is_active });
            fetchContents();
        } catch (error) {
            console.error('Error toggling content:', error);
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
        <div className="space-y-6" data-testid="content-page">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl text-white">Konten</h1>
                    <p className="text-slate-400 font-body mt-1">
                        Kelola poster, pengumuman, dan konten slideshow
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-content-button">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Konten
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-xl text-white">
                                {editingId ? 'Edit Konten' : 'Tambah Konten Baru'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Konten akan ditampilkan secara bergantian di layar TV
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Tipe Konten</Label>
                                <Select 
                                    value={formData.type} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="content-type-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="poster">Poster/Gambar</SelectItem>
                                        <SelectItem value="announcement">Pengumuman Teks</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-slate-300">Judul</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Judul konten"
                                    className="bg-slate-800 border-slate-700 text-white"
                                    data-testid="content-title-input"
                                />
                            </div>
                            
                            {formData.type === 'announcement' ? (
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Teks Pengumuman</Label>
                                    <Textarea
                                        value={formData.text}
                                        onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                                        placeholder="Isi pengumuman"
                                        className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                                        data-testid="content-text-input"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-slate-300">File</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.content_url}
                                            onChange={(e) => setFormData(prev => ({ ...prev, content_url: e.target.value }))}
                                            placeholder="URL file atau upload"
                                            className="bg-slate-800 border-slate-700 text-white flex-1"
                                            data-testid="content-url-input"
                                        />
                                        <input
                                            type="file"
                                            accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="content-upload"
                                        />
                                        <Button
                                            variant="outline"
                                            className="border-slate-700"
                                            onClick={() => document.getElementById('content-upload').click()}
                                            disabled={uploading}
                                        >
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    {formData.content_url && formData.type === 'poster' && (
                                        <img src={formData.content_url} alt="Preview" className="mt-2 max-h-32 rounded-lg" />
                                    )}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Durasi (detik)</Label>
                                    <Input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                                        className="bg-slate-800 border-slate-700 text-white"
                                        data-testid="content-duration-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Urutan</Label>
                                    <Input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                                        className="bg-slate-800 border-slate-700 text-white"
                                        data-testid="content-order-input"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-300">Aktif</Label>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                    data-testid="content-active-switch"
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
                                    data-testid="save-content-button"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            {/* Content List */}
            {contents.length === 0 ? (
                <Card className="bg-slate-900/80 border-slate-800">
                    <CardContent className="py-12 text-center">
                        <Image className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Belum ada konten</p>
                        <p className="text-slate-500 text-sm">Klik tombol "Tambah Konten" untuk memulai</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contents.map((content) => (
                        <Card key={content.id} className="bg-slate-900/80 border-slate-800" data-testid={`content-card-${content.id}`}>
                            <CardContent className="p-4">
                                {content.type === 'poster' && content.content_url && (
                                    <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden mb-3">
                                        <img src={content.content_url} alt={content.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                {content.type === 'announcement' && (
                                    <div className="aspect-video bg-slate-800 rounded-lg p-4 mb-3 flex items-center justify-center">
                                        <p className="text-slate-300 text-sm line-clamp-4">{content.text}</p>
                                    </div>
                                )}
                                {content.type === 'video' && (
                                    <div className="aspect-video bg-slate-800 rounded-lg mb-3 flex items-center justify-center">
                                        <span className="text-slate-500">Video</span>
                                    </div>
                                )}
                                
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-white font-body font-medium">{content.title}</h3>
                                        <p className="text-slate-500 text-sm">
                                            {content.type === 'poster' ? 'Poster' : content.type === 'announcement' ? 'Pengumuman' : 'Video'} • {content.duration}s
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Switch
                                            checked={content.is_active}
                                            onCheckedChange={() => handleToggleActive(content)}
                                            className="scale-75"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 mt-3">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1 border-slate-700"
                                        onClick={() => handleEdit(content)}
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-red-800 text-red-400 hover:bg-red-900/30"
                                        onClick={() => handleDelete(content.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
