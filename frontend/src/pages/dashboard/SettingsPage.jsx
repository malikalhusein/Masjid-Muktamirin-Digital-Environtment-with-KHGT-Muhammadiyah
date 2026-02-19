import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Bell, Clock } from 'lucide-react';
import { settingsAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import { PRAYER_NAMES } from '../../lib/utils';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        iqomah_subuh: 15,
        iqomah_dzuhur: 10,
        iqomah_ashar: 10,
        iqomah_maghrib: 5,
        iqomah_isya: 10,
        bell_enabled: true,
        bell_before_minutes: 5,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
        fetchSettings();
    }, []);
    
    const fetchSettings = async () => {
        try {
            const res = await settingsAPI.getPrayer();
            setSettings(res.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Gagal memuat pengaturan');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsAPI.updatePrayer(settings);
            toast.success('Pengaturan berhasil disimpan');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };
    
    const handleIqomahChange = (prayer, value) => {
        const numValue = parseInt(value) || 0;
        setSettings(prev => ({ ...prev, [`iqomah_${prayer}`]: numValue }));
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6" data-testid="settings-page">
            <div>
                <h1 className="font-heading text-3xl text-white">Pengaturan</h1>
                <p className="text-slate-400 font-body mt-1">
                    Atur durasi iqomah dan pengingat sholat
                </p>
            </div>
            
            {/* Iqomah Duration */}
            <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                    <CardTitle className="font-heading text-xl text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-400" />
                        Durasi Iqomah (menit)
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Waktu jeda antara adzan dan iqomah untuk setiap waktu sholat
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].map((prayer) => (
                            <div key={prayer} className="space-y-2">
                                <Label className="text-slate-300">
                                    {PRAYER_NAMES[prayer]?.id || prayer}
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={settings[`iqomah_${prayer}`]}
                                    onChange={(e) => handleIqomahChange(prayer, e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    data-testid={`iqomah-${prayer}-input`}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            {/* Bell/Ring Settings */}
            <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                    <CardTitle className="font-heading text-xl text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-emerald-400" />
                        Pengingat (Bell)
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Bunyi pengingat sebelum waktu sholat
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-white">Aktifkan Bell</Label>
                            <p className="text-slate-400 text-sm">Bunyi pengingat otomatis sebelum waktu sholat</p>
                        </div>
                        <Switch
                            checked={settings.bell_enabled}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, bell_enabled: checked }))}
                            data-testid="bell-enabled-switch"
                        />
                    </div>
                    
                    {settings.bell_enabled && (
                        <div className="space-y-2">
                            <Label className="text-slate-300">Bell berbunyi ... menit sebelum adzan</Label>
                            <Input
                                type="number"
                                min="1"
                                max="30"
                                value={settings.bell_before_minutes}
                                onChange={(e) => setSettings(prev => ({ ...prev, bell_before_minutes: parseInt(e.target.value) || 5 }))}
                                className="bg-slate-800 border-slate-700 text-white w-24"
                                data-testid="bell-before-input"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* Save Button */}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="save-settings-button"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </div>
        </div>
    );
}
