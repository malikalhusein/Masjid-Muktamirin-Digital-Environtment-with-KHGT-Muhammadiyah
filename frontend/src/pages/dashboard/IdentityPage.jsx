import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Save, Upload, Loader2, FileText, Image } from 'lucide-react';
import { mosqueAPI, uploadAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

export default function IdentityPage() {
    const [identity, setIdentity] = useState({
        name: '',
        address: '',
        logo_url: '',
        description: '',
        profile_image_url: '',
        latitude: -7.9404,
        longitude: 110.2357,
        elevation: 50,
        timezone_offset: 7,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    
    useEffect(() => {
        fetchIdentity();
    }, []);
    
    const fetchIdentity = async () => {
        try {
            const res = await mosqueAPI.getIdentity();
            setIdentity(res.data);
        } catch (error) {
            console.error('Error fetching identity:', error);
            toast.error('Gagal memuat data identitas');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = async () => {
        setSaving(true);
        try {
            await mosqueAPI.updateIdentity(identity);
            toast.success('Identitas masjid berhasil disimpan');
        } catch (error) {
            console.error('Error saving identity:', error);
            toast.error('Gagal menyimpan identitas');
        } finally {
            setSaving(false);
        }
    };
    
    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        try {
            const res = await uploadAPI.upload(file);
            setIdentity(prev => ({ ...prev, logo_url: res.data.url }));
            toast.success('Logo berhasil diunggah');
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error('Gagal mengunggah logo');
        } finally {
            setUploading(false);
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
        <div className="space-y-6" data-testid="identity-page">
            <div>
                <h1 className="font-heading text-3xl text-white">Identitas Masjid</h1>
                <p className="text-slate-400 font-body mt-1">
                    Kelola informasi dan lokasi masjid
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logo Upload */}
                <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl text-white">Logo Masjid</CardTitle>
                        <CardDescription className="text-slate-400">
                            Upload logo masjid (PNG, JPG)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center">
                            {identity.logo_url ? (
                                <img 
                                    src={identity.logo_url} 
                                    alt="Logo Masjid" 
                                    className="w-32 h-32 rounded-full object-cover border-2 border-emerald-500"
                                    data-testid="mosque-logo"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                                    <Building2 className="w-12 h-12 text-slate-500" />
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                                data-testid="logo-upload-input"
                            />
                            <Button 
                                variant="outline" 
                                className="w-full border-slate-700 text-slate-300"
                                onClick={() => document.getElementById('logo-upload').click()}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                {uploading ? 'Mengunggah...' : 'Upload Logo'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Basic Info */}
                <Card className="bg-slate-900/80 border-slate-800 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-400" />
                            Informasi Dasar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Nama Masjid</Label>
                            <Input
                                id="name"
                                data-testid="mosque-name-input"
                                value={identity.name}
                                onChange={(e) => setIdentity(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Masukkan nama masjid"
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-slate-300">Alamat</Label>
                            <Input
                                id="address"
                                data-testid="mosque-address-input"
                                value={identity.address}
                                onChange={(e) => setIdentity(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Masukkan alamat masjid"
                                className="bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                    </CardContent>
                </Card>
                
                {/* Location Settings */}
                <Card className="bg-slate-900/80 border-slate-800 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                            Lokasi (untuk perhitungan waktu sholat KHGT)
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Koordinat GPS digunakan untuk menghitung jadwal sholat sesuai lokasi masjid
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude" className="text-slate-300">Latitude</Label>
                                <Input
                                    id="latitude"
                                    data-testid="latitude-input"
                                    type="number"
                                    step="0.0001"
                                    value={identity.latitude}
                                    onChange={(e) => setIdentity(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude" className="text-slate-300">Longitude</Label>
                                <Input
                                    id="longitude"
                                    data-testid="longitude-input"
                                    type="number"
                                    step="0.0001"
                                    value={identity.longitude}
                                    onChange={(e) => setIdentity(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="elevation" className="text-slate-300">Elevasi (meter)</Label>
                                <Input
                                    id="elevation"
                                    data-testid="elevation-input"
                                    type="number"
                                    value={identity.elevation}
                                    onChange={(e) => setIdentity(prev => ({ ...prev, elevation: parseInt(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone" className="text-slate-300">Timezone (UTC+)</Label>
                                <Input
                                    id="timezone"
                                    data-testid="timezone-input"
                                    type="number"
                                    value={identity.timezone_offset}
                                    onChange={(e) => setIdentity(prev => ({ ...prev, timezone_offset: parseInt(e.target.value) }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="save-identity-button"
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
