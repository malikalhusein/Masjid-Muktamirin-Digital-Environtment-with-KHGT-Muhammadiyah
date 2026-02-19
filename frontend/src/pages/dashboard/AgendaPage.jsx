import { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, Edit2, Save, Loader2, MapPin, Clock } from 'lucide-react';
import { agendaAPI } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';

export default function AgendaPage() {
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        is_active: true,
    });
    
    useEffect(() => {
        fetchAgendas();
    }, []);
    
    const fetchAgendas = async () => {
        try {
            const res = await agendaAPI.getAll();
            setAgendas(res.data);
        } catch (error) {
            console.error('Error fetching agendas:', error);
            toast.error('Gagal memuat agenda');
        } finally {
            setLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            event_date: '',
            event_time: '',
            location: '',
            is_active: true,
        });
        setEditingId(null);
    };
    
    const handleSubmit = async () => {
        if (!formData.title || !formData.event_date || !formData.event_time) {
            toast.error('Judul, tanggal, dan waktu harus diisi');
            return;
        }
        
        setSaving(true);
        try {
            if (editingId) {
                await agendaAPI.update(editingId, formData);
                toast.success('Agenda berhasil diperbarui');
            } else {
                await agendaAPI.create(formData);
                toast.success('Agenda berhasil ditambahkan');
            }
            setDialogOpen(false);
            resetForm();
            fetchAgendas();
        } catch (error) {
            console.error('Error saving agenda:', error);
            toast.error('Gagal menyimpan agenda');
        } finally {
            setSaving(false);
        }
    };
    
    const handleEdit = (agenda) => {
        setFormData(agenda);
        setEditingId(agenda.id);
        setDialogOpen(true);
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus agenda ini?')) return;
        
        try {
            await agendaAPI.delete(id);
            toast.success('Agenda berhasil dihapus');
            fetchAgendas();
        } catch (error) {
            console.error('Error deleting agenda:', error);
            toast.error('Gagal menghapus agenda');
        }
    };
    
    const handleToggleActive = async (agenda) => {
        try {
            await agendaAPI.update(agenda.id, { is_active: !agenda.is_active });
            fetchAgendas();
        } catch (error) {
            console.error('Error toggling agenda:', error);
        }
    };
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6" data-testid="agenda-page">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl text-white">Agenda Masjid</h1>
                    <p className="text-slate-400 font-body mt-1">
                        Kelola jadwal kegiatan, kajian, dan pengajian
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-agenda-button">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Agenda
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-xl text-white">
                                {editingId ? 'Edit Agenda' : 'Tambah Agenda Baru'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Agenda akan ditampilkan di layar TV masjid
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Judul Kegiatan</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Contoh: Kajian Rutin Malam Jumat"
                                    className="bg-slate-800 border-slate-700 text-white"
                                    data-testid="agenda-title-input"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-slate-300">Deskripsi (opsional)</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Keterangan tambahan"
                                    className="bg-slate-800 border-slate-700 text-white"
                                    data-testid="agenda-description-input"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Tanggal</Label>
                                    <Input
                                        type="date"
                                        value={formData.event_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                                        className="bg-slate-800 border-slate-700 text-white"
                                        data-testid="agenda-date-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Waktu</Label>
                                    <Input
                                        type="time"
                                        value={formData.event_time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                                        className="bg-slate-800 border-slate-700 text-white"
                                        data-testid="agenda-time-input"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-slate-300">Lokasi (opsional)</Label>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="Contoh: Aula Masjid"
                                    className="bg-slate-800 border-slate-700 text-white"
                                    data-testid="agenda-location-input"
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-300">Aktif</Label>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                    data-testid="agenda-active-switch"
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
                                    data-testid="save-agenda-button"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            {/* Agenda List */}
            {agendas.length === 0 ? (
                <Card className="bg-slate-900/80 border-slate-800">
                    <CardContent className="py-12 text-center">
                        <CalendarDays className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Belum ada agenda</p>
                        <p className="text-slate-500 text-sm">Klik tombol "Tambah Agenda" untuk memulai</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {agendas.map((agenda) => (
                        <Card key={agenda.id} className={`bg-slate-900/80 border-slate-800 ${!agenda.is_active ? 'opacity-50' : ''}`} data-testid={`agenda-card-${agenda.id}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-white font-body font-medium text-lg">{agenda.title}</h3>
                                        {agenda.description && (
                                            <p className="text-slate-400 text-sm mt-1">{agenda.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                            <div className="flex items-center gap-1 text-gold-400">
                                                <CalendarDays className="w-4 h-4" />
                                                <span>{formatDate(agenda.event_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-emerald-400">
                                                <Clock className="w-4 h-4" />
                                                <span>{agenda.event_time}</span>
                                            </div>
                                            {agenda.location && (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{agenda.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={agenda.is_active}
                                            onCheckedChange={() => handleToggleActive(agenda)}
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="text-slate-400 hover:text-white"
                                            onClick={() => handleEdit(agenda)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="text-red-400 hover:text-red-300"
                                            onClick={() => handleDelete(agenda.id)}
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
