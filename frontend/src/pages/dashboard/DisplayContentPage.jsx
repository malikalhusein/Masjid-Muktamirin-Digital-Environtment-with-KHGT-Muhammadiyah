import { useState, useEffect } from 'react';
import { Image, Plus, Trash2, Edit2, Save, X, Upload, Loader2, CalendarDays, Type, GripVertical, MapPin, Clock } from 'lucide-react';
import { contentAPI, runningTextAPI, uploadAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';

// Content Section Component
function ContentSection() {
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
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ type: 'poster', title: '', content_url: '', text: '', duration: 10, is_active: true, order: 0 });
        setEditingId(null);
    };

    const handleSubmit = async () => {
        if (!formData.title) { toast.error('Judul harus diisi'); return; }
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
            toast.error('Gagal menyimpan konten');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (content) => { setFormData(content); setEditingId(content.id); setDialogOpen(true); };
    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus konten ini?')) return;
        try {
            await contentAPI.delete(id);
            toast.success('Konten berhasil dihapus');
            fetchContents();
        } catch (error) {
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
            toast.error('Gagal mengunggah file');
        } finally {
            setUploading(false);
        }
    };

    const handleToggleActive = async (content) => {
        try {
            await contentAPI.update(content.id, { is_active: !content.is_active });
            fetchContents();
        } catch (error) { }
    };

    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Poster, pengumuman, dan konten slideshow</p>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-content-button">
                            <Plus className="w-4 h-4 mr-1" /> Tambah
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-xl text-white">{editingId ? 'Edit Konten' : 'Tambah Konten'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Tipe</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="poster">Poster/Gambar</SelectItem>
                                        <SelectItem value="announcement">Pengumuman</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Judul</Label>
                                <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" data-testid="content-title-input" />
                            </div>
                            {formData.type === 'announcement' ? (
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Teks</Label>
                                    <Textarea value={formData.text} onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-slate-300">File</Label>
                                    <div className="flex gap-2">
                                        <Input value={formData.content_url} onChange={(e) => setFormData(prev => ({ ...prev, content_url: e.target.value }))} placeholder="URL" className="bg-slate-800 border-slate-700 text-white flex-1" />
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="content-upload" />
                                        <Button variant="outline" className="border-slate-700" onClick={() => document.getElementById('content-upload').click()} disabled={uploading}>
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    {formData.content_url && <img src={formData.content_url} alt="Preview" className="mt-2 max-h-24 rounded-lg" />}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Durasi (detik)</Label>
                                    <Input type="number" value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))} className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                                <div className="flex items-center justify-between pt-6">
                                    <Label className="text-slate-300">Aktif</Label>
                                    <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="border-slate-700">Batal</Button>
                                <Button onClick={handleSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Simpan
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {contents.length === 0 ? (
                <div className="text-center py-8 text-slate-500"><Image className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Belum ada konten</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {contents.map((content) => (
                        <Card key={content.id} className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-3">
                                {content.type === 'poster' && content.content_url && (
                                    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden mb-2">
                                        <img src={content.content_url} alt={content.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                {content.type === 'announcement' && (
                                    <div className="aspect-video bg-slate-900 rounded-lg p-3 mb-2 flex items-center justify-center">
                                        <p className="text-slate-300 text-xs line-clamp-3">{content.text}</p>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-medium text-sm">{content.title}</h3>
                                        <p className="text-slate-500 text-xs">{content.duration}s</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Switch checked={content.is_active} onCheckedChange={() => handleToggleActive(content)} className="scale-75" />
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(content)}><Edit2 className="w-3 h-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => handleDelete(content.id)}><Trash2 className="w-3 h-3" /></Button>
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



// Running Text Section Component
function RunningTextSection() {
    const [texts, setTexts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ text: '', is_active: true, order: 0 });

    useEffect(() => { fetchTexts(); }, []);

    const fetchTexts = async () => {
        try { const res = await runningTextAPI.getAll(); setTexts(res.data); } catch (error) { } finally { setLoading(false); }
    };

    const resetForm = () => { setFormData({ text: '', is_active: true, order: texts.length }); setEditingId(null); };

    const handleSubmit = async () => {
        if (!formData.text) { toast.error('Teks harus diisi'); return; }
        setSaving(true);
        try {
            if (editingId) { await runningTextAPI.update(editingId, formData); toast.success('Teks diperbarui'); }
            else { await runningTextAPI.create(formData); toast.success('Teks ditambahkan'); }
            setDialogOpen(false); resetForm(); fetchTexts();
        } catch (error) { toast.error('Gagal menyimpan'); } finally { setSaving(false); }
    };

    const handleEdit = (text) => { setFormData(text); setEditingId(text.id); setDialogOpen(true); };
    const handleDelete = async (id) => {
        if (!window.confirm('Hapus teks ini?')) return;
        try { await runningTextAPI.delete(id); toast.success('Teks dihapus'); fetchTexts(); } catch (error) { toast.error('Gagal menghapus'); }
    };
    const handleToggleActive = async (text) => {
        try { await runningTextAPI.update(text.id, { is_active: !text.is_active }); fetchTexts(); } catch (error) { }
    };

    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Teks berjalan di bagian bawah layar</p>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-text-button">
                            <Plus className="w-4 h-4 mr-1" /> Tambah
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
                        <DialogHeader><DialogTitle className="font-heading text-xl text-white">{editingId ? 'Edit Teks' : 'Tambah Teks'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2"><Label className="text-slate-300">Teks</Label><Input value={formData.text} onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" data-testid="text-input" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label className="text-slate-300">Urutan</Label><Input type="number" value={formData.order} onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))} className="bg-slate-800 border-slate-700 text-white" /></div>
                                <div className="flex items-center justify-between pt-6"><Label className="text-slate-300">Aktif</Label><Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} /></div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="border-slate-700">Batal</Button>
                                <Button onClick={handleSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Simpan</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {texts.filter(t => t.is_active).length > 0 && (
                <Card className="bg-emerald-900/30 border-emerald-800">
                    <CardContent className="p-3">
                        <p className="text-slate-400 text-xs mb-1">Preview:</p>
                        <p className="text-emerald-100 text-sm">{texts.filter(t => t.is_active).map(t => t.text).join('  •  ')}</p>
                    </CardContent>
                </Card>
            )}

            {texts.length === 0 ? (
                <div className="text-center py-8 text-slate-500"><Type className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Belum ada teks</p></div>
            ) : (
                <div className="space-y-2">
                    {texts.map((text) => (
                        <Card key={text.id} className={`bg-slate-800/50 border-slate-700 ${!text.is_active ? 'opacity-50' : ''}`}>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-slate-600" />
                                    <span className="text-slate-500 text-xs w-6">#{text.order}</span>
                                    <p className="flex-1 text-white text-sm truncate">{text.text}</p>
                                    <div className="flex items-center gap-1">
                                        <Switch checked={text.is_active} onCheckedChange={() => handleToggleActive(text)} className="scale-75" />
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(text)}><Edit2 className="w-3 h-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => handleDelete(text.id)}><Trash2 className="w-3 h-3" /></Button>
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

// Main Display Content Page
export default function DisplayContentPage() {
    return (
        <div className="space-y-6" data-testid="display-content-page">
            <div>
                <h1 className="font-heading text-3xl text-white">Display Konten</h1>
                <p className="text-slate-400 font-body mt-1">
                    Kelola konten yang ditampilkan di layar TV masjid
                </p>
            </div>

            <Tabs defaultValue="content" className="space-y-6">
                <TabsList className="bg-slate-800">
                    <TabsTrigger value="content" className="data-[state=active]:bg-emerald-900 flex items-center gap-2">
                        <Image className="w-4 h-4" /> Konten
                    </TabsTrigger>

                    <TabsTrigger value="running-text" className="data-[state=active]:bg-emerald-900 flex items-center gap-2">
                        <Type className="w-4 h-4" /> Running Text
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                    <Card className="bg-slate-900/80 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="font-heading text-lg text-white flex items-center gap-2">
                                <Image className="w-5 h-5 text-emerald-400" /> Konten Slideshow
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ContentSection />
                        </CardContent>
                    </Card>
                </TabsContent>



                <TabsContent value="running-text">
                    <Card className="bg-slate-900/80 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="font-heading text-lg text-white flex items-center gap-2">
                                <Type className="w-5 h-5 text-emerald-400" /> Running Text
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RunningTextSection />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
