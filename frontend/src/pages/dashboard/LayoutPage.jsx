import { useState, useEffect } from 'react';
import { Palette, Save, Loader2, Check } from 'lucide-react';
import { settingsAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const THEMES = [
    { id: 'modern', name: 'Modern', description: 'Tema modern minimalis dark mode dengan glass effect' },
    { id: 'classic', name: 'Klasik', description: 'Tema klasik dengan background foto masjid (seperti referensi)' },
    { id: 'layout2', name: 'Al-Iftitar', description: 'Layout sidebar dengan quote dan konten slideshow besar' },
];

const COLOR_PRESETS = [
    { name: 'Emerald', primary: '#064E3B', secondary: '#D97706' },
    { name: 'Teal', primary: '#0D9488', secondary: '#F59E0B' },
    { name: 'Blue', primary: '#1E40AF', secondary: '#EA580C' },
    { name: 'Purple', primary: '#581C87', secondary: '#F97316' },
];

export default function LayoutPage() {
    const [settings, setSettings] = useState({
        theme: 'modern',
        primary_color: '#064E3B',
        secondary_color: '#D97706',
        background_image: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
        fetchSettings();
    }, []);
    
    const fetchSettings = async () => {
        try {
            const res = await settingsAPI.getLayout();
            setSettings(res.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Gagal memuat pengaturan tampilan');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsAPI.updateLayout(settings);
            toast.success('Pengaturan tampilan berhasil disimpan');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };
    
    const applyColorPreset = (preset) => {
        setSettings(prev => ({
            ...prev,
            primary_color: preset.primary,
            secondary_color: preset.secondary,
        }));
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6" data-testid="layout-page">
            <div>
                <h1 className="font-heading text-3xl text-white">Pengaturan Tampilan</h1>
                <p className="text-slate-400 font-body mt-1">
                    Sesuaikan tema dan warna tampilan TV
                </p>
            </div>
            
            {/* Theme Selection */}
            <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                    <CardTitle className="font-heading text-xl text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-emerald-400" />
                        Pilih Tema
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {THEMES.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => setSettings(prev => ({ ...prev, theme: theme.id }))}
                                className={cn(
                                    "p-4 rounded-lg border-2 text-left transition-all",
                                    settings.theme === theme.id
                                        ? "border-emerald-500 bg-emerald-900/30"
                                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                )}
                                data-testid={`theme-${theme.id}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-body font-medium text-white">{theme.name}</span>
                                    {settings.theme === theme.id && (
                                        <Check className="w-5 h-5 text-emerald-400" />
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm">{theme.description}</p>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            {/* Color Settings */}
            <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                    <CardTitle className="font-heading text-xl text-white">Warna</CardTitle>
                    <CardDescription className="text-slate-400">
                        Pilih preset warna atau tentukan warna kustom
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Color Presets */}
                    <div>
                        <Label className="text-slate-300 mb-3 block">Preset Warna</Label>
                        <div className="flex flex-wrap gap-3">
                            {COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => applyColorPreset(preset)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                                        settings.primary_color === preset.primary
                                            ? "border-white bg-slate-700"
                                            : "border-slate-700 hover:border-slate-600"
                                    )}
                                >
                                    <div 
                                        className="w-5 h-5 rounded-full" 
                                        style={{ backgroundColor: preset.primary }}
                                    />
                                    <div 
                                        className="w-5 h-5 rounded-full" 
                                        style={{ backgroundColor: preset.secondary }}
                                    />
                                    <span className="text-white text-sm">{preset.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Custom Colors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primary-color" className="text-slate-300">Warna Utama</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    id="primary-color"
                                    value={settings.primary_color}
                                    onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                                    className="w-12 h-10 rounded cursor-pointer"
                                    data-testid="primary-color-input"
                                />
                                <Input
                                    value={settings.primary_color}
                                    onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secondary-color" className="text-slate-300">Warna Aksen</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    id="secondary-color"
                                    value={settings.secondary_color}
                                    onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                                    className="w-12 h-10 rounded cursor-pointer"
                                    data-testid="secondary-color-input"
                                />
                                <Input
                                    value={settings.secondary_color}
                                    onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Preview */}
                    <div>
                        <Label className="text-slate-300 mb-3 block">Preview</Label>
                        <div 
                            className="p-6 rounded-lg border border-slate-700"
                            style={{ backgroundColor: settings.primary_color }}
                        >
                            <p className="text-white font-heading text-2xl mb-2">Nama Masjid</p>
                            <p 
                                className="font-body"
                                style={{ color: settings.secondary_color }}
                            >
                                Waktu Sholat: 12:00
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Background Image */}
            <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                    <CardTitle className="font-heading text-xl text-white">Gambar Latar (Opsional)</CardTitle>
                    <CardDescription className="text-slate-400">
                        URL gambar untuk latar belakang display TV
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        value={settings.background_image}
                        onChange={(e) => setSettings(prev => ({ ...prev, background_image: e.target.value }))}
                        placeholder="https://example.com/background.jpg"
                        className="bg-slate-800 border-slate-700 text-white"
                        data-testid="background-image-input"
                    />
                    {settings.background_image && (
                        <img 
                            src={settings.background_image} 
                            alt="Background preview" 
                            className="mt-4 max-h-32 rounded-lg"
                        />
                    )}
                </CardContent>
            </Card>
            
            {/* Save Button */}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="save-layout-button"
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
