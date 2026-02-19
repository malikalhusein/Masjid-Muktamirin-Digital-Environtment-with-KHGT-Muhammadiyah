import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Bell, Clock, Volume2, Timer, PlayCircle } from 'lucide-react';
import { settingsAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { PRAYER_NAMES, playNotificationSound, SOUND_TYPES } from '../../lib/utils';

const PRAYERS = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];

// Test sound function using the new sound system
const playTestSound = (type) => {
    const soundType = {
        'pre_adzan': SOUND_TYPES.PRE_ADZAN,
        'adzan': SOUND_TYPES.ADZAN,
        'pre_iqamah': SOUND_TYPES.PRE_IQAMAH,
        'iqamah': SOUND_TYPES.IQAMAH,
    }[type] || SOUND_TYPES.ADZAN;
    
    const success = playNotificationSound(soundType);
    if (success) {
        toast.success(`Tes bunyi ${type.replace('_', ' ')}`);
    } else {
        toast.error('Tidak dapat memutar suara');
    }
};

// Calibration Card per Prayer
const PrayerCalibrationCard = ({ prayer, settings, onChange }) => {
    const calibration = settings[`calibration_${prayer}`] || {
        pre_adzan: 1,
        jeda_adzan: 3,
        pre_iqamah: 10,
        jeda_sholat: 10,
    };
    
    const updateCalibration = (field, value) => {
        const newCalibration = { ...calibration, [field]: parseInt(value) || 0 };
        onChange(`calibration_${prayer}`, newCalibration);
    };
    
    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    {PRAYER_NAMES[prayer]?.id || prayer}
                    <span className="text-slate-400 font-arabic text-sm ml-2">{PRAYER_NAMES[prayer]?.ar}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            Peringatan Sebelum Adzan
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="0"
                                max="30"
                                value={calibration.pre_adzan}
                                onChange={(e) => updateCalibration('pre_adzan', e.target.value)}
                                className="bg-slate-900 border-slate-600 text-white w-20"
                                data-testid={`calibration-${prayer}-pre-adzan`}
                            />
                            <span className="text-slate-400 text-sm">menit</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            Jeda Adzan
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                value={calibration.jeda_adzan}
                                onChange={(e) => updateCalibration('jeda_adzan', e.target.value)}
                                className="bg-slate-900 border-slate-600 text-white w-20"
                                data-testid={`calibration-${prayer}-jeda-adzan`}
                            />
                            <span className="text-slate-400 text-sm">menit</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            Peringatan Sebelum Iqamah
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="1"
                                max="30"
                                value={calibration.pre_iqamah}
                                onChange={(e) => updateCalibration('pre_iqamah', e.target.value)}
                                className="bg-slate-900 border-slate-600 text-white w-20"
                                data-testid={`calibration-${prayer}-pre-iqamah`}
                            />
                            <span className="text-slate-400 text-sm">menit</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" />
                            Jeda Sholat
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="5"
                                max="30"
                                value={calibration.jeda_sholat}
                                onChange={(e) => updateCalibration('jeda_sholat', e.target.value)}
                                className="bg-slate-900 border-slate-600 text-white w-20"
                                data-testid={`calibration-${prayer}-jeda-sholat`}
                            />
                            <span className="text-slate-400 text-sm">menit</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function CalibrationPage() {
    const [settings, setSettings] = useState({
        iqomah_subuh: 15,
        iqomah_dzuhur: 10,
        iqomah_ashar: 10,
        iqomah_maghrib: 5,
        iqomah_isya: 10,
        bell_enabled: true,
        bell_before_minutes: 5,
        calibration_subuh: { pre_adzan: 1, jeda_adzan: 3, pre_iqamah: 15, jeda_sholat: 10 },
        calibration_dzuhur: { pre_adzan: 1, jeda_adzan: 3, pre_iqamah: 10, jeda_sholat: 10 },
        calibration_ashar: { pre_adzan: 1, jeda_adzan: 3, pre_iqamah: 10, jeda_sholat: 10 },
        calibration_maghrib: { pre_adzan: 1, jeda_adzan: 3, pre_iqamah: 5, jeda_sholat: 10 },
        calibration_isya: { pre_adzan: 1, jeda_adzan: 3, pre_iqamah: 10, jeda_sholat: 10 },
        sound_pre_adzan: true,
        sound_adzan: true,
        sound_pre_iqamah: true,
        sound_iqamah: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
        fetchSettings();
    }, []);
    
    const fetchSettings = async () => {
        try {
            const res = await settingsAPI.getPrayer();
            setSettings(prev => ({ ...prev, ...res.data }));
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Gagal memuat pengaturan');
        } finally {
            setLoading(false);
        }
    };
    
    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsAPI.updatePrayer(settings);
            toast.success('Pengaturan kalibrasi berhasil disimpan');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
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
        <div className="space-y-6" data-testid="calibration-page">
            <div>
                <h1 className="font-heading text-3xl text-white">Kalibrasi Waktu Sholat</h1>
                <p className="text-slate-400 font-body mt-1">
                    Atur peringatan adzan, jeda adzan, iqamah, dan durasi sholat untuk setiap waktu
                </p>
            </div>
            
            <Tabs defaultValue="calibration" className="space-y-6">
                <TabsList className="bg-slate-800">
                    <TabsTrigger value="calibration" className="data-[state=active]:bg-emerald-900">
                        Kalibrasi per Waktu
                    </TabsTrigger>
                    <TabsTrigger value="sounds" className="data-[state=active]:bg-emerald-900">
                        Bunyi Notifikasi
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="calibration" className="space-y-4">
                    {/* Info Card */}
                    <Card className="bg-emerald-900/30 border-emerald-800">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-emerald-400" />
                                    <div>
                                        <p className="text-white font-medium">Peringatan Adzan</p>
                                        <p className="text-emerald-300 text-xs">Bunyi X menit sebelum adzan</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-gold-400" />
                                    <div>
                                        <p className="text-white font-medium">Jeda Adzan</p>
                                        <p className="text-gold-300 text-xs">Durasi kumandang adzan</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-teal-400" />
                                    <div>
                                        <p className="text-white font-medium">Peringatan Iqamah</p>
                                        <p className="text-teal-300 text-xs">Countdown menuju iqamah</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="w-4 h-4 text-blue-400" />
                                    <div>
                                        <p className="text-white font-medium">Jeda Sholat</p>
                                        <p className="text-blue-300 text-xs">Estimasi durasi sholat</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Calibration Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {PRAYERS.map((prayer) => (
                            <PrayerCalibrationCard
                                key={prayer}
                                prayer={prayer}
                                settings={settings}
                                onChange={handleChange}
                            />
                        ))}
                    </div>
                </TabsContent>
                
                <TabsContent value="sounds" className="space-y-4">
                    <Card className="bg-slate-900/80 border-slate-800">
                        <CardHeader>
                            <CardTitle className="font-heading text-xl text-white flex items-center gap-2">
                                <Volume2 className="w-5 h-5 text-emerald-400" />
                                Bunyi Notifikasi
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Aktifkan/nonaktifkan bunyi pengingat untuk setiap tahapan waktu sholat
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pre-Adzan */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <p className="text-white font-medium">Peringatan Sebelum Adzan</p>
                                            <p className="text-slate-400 text-sm">Bunyi pengingat jamaah</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => playTestSound('pre_adzan')}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                        </Button>
                                        <Switch
                                            checked={settings.sound_pre_adzan}
                                            onCheckedChange={(checked) => handleChange('sound_pre_adzan', checked)}
                                            data-testid="sound-pre-adzan"
                                        />
                                    </div>
                                </div>
                                
                                {/* Adzan */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Volume2 className="w-5 h-5 text-gold-400" />
                                        <div>
                                            <p className="text-white font-medium">Waktu Adzan</p>
                                            <p className="text-slate-400 text-sm">Bunyi saat adzan dimulai</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => playTestSound('adzan')}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                        </Button>
                                        <Switch
                                            checked={settings.sound_adzan}
                                            onCheckedChange={(checked) => handleChange('sound_adzan', checked)}
                                            data-testid="sound-adzan"
                                        />
                                    </div>
                                </div>
                                
                                {/* Pre-Iqamah */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Timer className="w-5 h-5 text-teal-400" />
                                        <div>
                                            <p className="text-white font-medium">Peringatan Sebelum Iqamah</p>
                                            <p className="text-slate-400 text-sm">Pengingat bersiap sholat</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => playTestSound('pre_iqamah')}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                        </Button>
                                        <Switch
                                            checked={settings.sound_pre_iqamah}
                                            onCheckedChange={(checked) => handleChange('sound_pre_iqamah', checked)}
                                            data-testid="sound-pre-iqamah"
                                        />
                                    </div>
                                </div>
                                
                                {/* Iqamah */}
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <PlayCircle className="w-5 h-5 text-blue-400" />
                                        <div>
                                            <p className="text-white font-medium">Waktu Iqamah</p>
                                            <p className="text-slate-400 text-sm">Bunyi saat iqamah dimulai</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => playTestSound('iqamah')}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                        </Button>
                                        <Switch
                                            checked={settings.sound_iqamah}
                                            onCheckedChange={(checked) => handleChange('sound_iqamah', checked)}
                                            data-testid="sound-iqamah"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            {/* Save Button */}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="save-calibration-button"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
            </div>
        </div>
    );
}
