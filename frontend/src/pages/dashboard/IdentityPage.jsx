import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Save, Upload, Loader2, FileText, Image, Users, Search } from 'lucide-react';
import { mosqueAPI, uploadAPI } from '../../lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import PengurusPage from './PengurusPage';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);

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

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingProfile(true);
        try {
            const res = await uploadAPI.upload(file);
            setIdentity(prev => ({ ...prev, profile_image_url: res.data.url }));
            toast.success('Foto profil berhasil diunggah');
        } catch (error) {
            console.error('Error uploading profile image:', error);
            toast.error('Gagal mengunggah foto profil');
        } finally {
            setUploadingProfile(false);
        }
    };

    const handleSearchLocation = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearchingLocation(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setIdentity(prev => ({
                    ...prev,
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon)
                }));
                toast.success('Lokasi berhasil ditemukan!');
            } else {
                toast.error('Lokasi tidak ditemukan. Coba kata kunci yang lebih spesifik.');
            }
        } catch (error) {
            console.error('Error pencarian lokasi:', error);
            toast.error('Terjadi kesalahan saat mencari lokasi.');
        } finally {
            setIsSearchingLocation(false);
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

            <Tabs defaultValue="identity" className="space-y-6">
                <TabsList className="bg-slate-800">
                    <TabsTrigger value="identity" className="data-[state=active]:bg-emerald-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Profil & Lokasi
                    </TabsTrigger>
                    <TabsTrigger value="pengurus" className="data-[state=active]:bg-purple-900 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Struktur Pengurus
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="space-y-6">
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

                        {/* Profile Description */}
                        <Card className="bg-slate-900/80 border-slate-800 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="font-heading text-xl text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-400" />
                                    Profil & Sejarah Masjid
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Teks ini akan ditampilkan di halaman "Tentang Kami" website
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Profile Image Upload */}
                                    <div className="space-y-4">
                                        <Label className="text-slate-300">Foto Profil Masjid</Label>
                                        <div className="aspect-video rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                                            {identity.profile_image_url ? (
                                                <img
                                                    src={identity.profile_image_url}
                                                    alt="Foto Profil Masjid"
                                                    className="w-full h-full object-cover"
                                                    data-testid="profile-image"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Image className="w-12 h-12 text-slate-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileImageUpload}
                                                className="hidden"
                                                id="profile-image-upload"
                                                data-testid="profile-image-upload-input"
                                            />
                                            <Button
                                                variant="outline"
                                                className="w-full border-slate-700 text-slate-300"
                                                onClick={() => document.getElementById('profile-image-upload').click()}
                                                disabled={uploadingProfile}
                                            >
                                                {uploadingProfile ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Upload className="w-4 h-4 mr-2" />
                                                )}
                                                {uploadingProfile ? 'Mengunggah...' : 'Upload Foto Profil'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Description Textarea */}
                                    <div className="lg:col-span-2 space-y-2">
                                        <Label htmlFor="description" className="text-slate-300">Deskripsi / Sejarah Masjid</Label>
                                        <Textarea
                                            id="description"
                                            data-testid="mosque-description-input"
                                            value={identity.description || ''}
                                            onChange={(e) => setIdentity(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Tulis deskripsi atau sejarah masjid di sini..."
                                            className="bg-slate-800 border-slate-700 text-white min-h-[200px] resize-y"
                                            rows={10}
                                        />
                                        <p className="text-xs text-slate-500">
                                            Tips: Gunakan baris baru (Enter) untuk membuat paragraf baru
                                        </p>
                                    </div>
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
                                    Koordinat GPS digunakan untuk menghitung jadwal sholat sesuai lokasi masjid.
                                    Anda dapat membuka <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Google Maps</a>, klik kanan pada lokasi Anda, pilih koordinat untuk menyalinnya, lalu tempel di bawah ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Pencarian Lokasi */}
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation(e)}
                                            placeholder="Cari lokasi bangunan / nama tempat (Misal: Masjid Istiqlal Jakarta)"
                                            className="bg-slate-800 border-slate-700 text-white pl-10"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleSearchLocation}
                                        disabled={isSearchingLocation || !searchQuery.trim()}
                                        className="bg-slate-700 hover:bg-slate-600 text-white shrink-0"
                                    >
                                        {isSearchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari Lokasi'}
                                    </Button>
                                </div>

                                {/* Peta Embed Google Maps */}
                                <div className="w-full h-[350px] rounded-xl overflow-hidden border border-slate-700 relative bg-slate-800 group">
                                    {identity.latitude && identity.longitude ? (
                                        <iframe
                                            title="Peta Lokasi Masjid"
                                            src={`https://maps.google.com/maps?q=${identity.latitude},${identity.longitude}&z=16&output=embed`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                            Masukkan koordinat Latitude & Longitude untuk melihat peta
                                        </div>
                                    )}
                                </div>

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
                </TabsContent>

                <TabsContent value="pengurus" className="m-0 border-none p-0">
                    <Card className="bg-slate-900/80 border-slate-800">
                        <CardContent className="pt-6">
                            <PengurusPage isEmbedded={true} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
