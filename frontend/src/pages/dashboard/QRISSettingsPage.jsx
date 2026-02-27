import { useState, useEffect, useCallback } from 'react';
import { QrCode, Save, Upload } from 'lucide-react';
import { qrisAPI, uploadAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

export default function QRISSettingsPage({ isEmbedded = false }) {
    const [settings, setSettings] = useState({
        qris_image_url: '',
        bank_name: 'BSI (Bank Syariah Indonesia)',
        account_number: '7148254552',
        account_name: 'Masjid Muktamirin'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await qrisAPI.getSettings();
            setSettings(res.data);
        } catch (error) {
            console.error('Error fetching QRIS settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await qrisAPI.updateSettings(settings);
            toast.success('Pengaturan QRIS berhasil disimpan');
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('Hanya admin yang dapat mengubah pengaturan QRIS');
            } else {
                toast.error('Gagal menyimpan pengaturan');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await uploadAPI.upload(file);
            setSettings(p => ({ ...p, qris_image_url: res.data.url }));
            toast.success('Gambar QRIS berhasil diupload');
        } catch (error) {
            toast.error('Gagal upload gambar');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="qris-settings-page">
            {/* Header */}
            {!isEmbedded && (
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <QrCode className="w-7 h-7 text-amber-400" />
                        Pengaturan QRIS & Rekening
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Kelola informasi donasi dan QRIS masjid</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QRIS Image */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Gambar QRIS</h2>

                    <div className="bg-slate-900/50 rounded-xl p-6 text-center mb-4">
                        {settings.qris_image_url ? (
                            <img
                                src={settings.qris_image_url}
                                alt="QRIS"
                                className="max-w-[250px] mx-auto rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8">
                                <QrCode className="w-16 h-16 text-slate-500 mx-auto mb-2" />
                                <p className="text-slate-400 text-sm">Belum ada gambar QRIS</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 mb-2 block">Upload Gambar QRIS Baru</label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="bg-slate-800 border-slate-700"
                        />
                        <p className="text-xs text-slate-500 mt-2">Format: JPG, PNG, WebP. Max 5MB.</p>
                    </div>
                </div>

                {/* Bank Info */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Informasi Rekening</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Nama Bank</label>
                            <Input
                                value={settings.bank_name}
                                onChange={(e) => setSettings(p => ({ ...p, bank_name: e.target.value }))}
                                className="bg-slate-800 border-slate-700"
                                placeholder="BSI (Bank Syariah Indonesia)"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Nomor Rekening</label>
                            <Input
                                value={settings.account_number}
                                onChange={(e) => setSettings(p => ({ ...p, account_number: e.target.value }))}
                                className="bg-slate-800 border-slate-700 font-mono"
                                placeholder="1234567890"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Nama Pemilik Rekening</label>
                            <Input
                                value={settings.account_name}
                                onChange={(e) => setSettings(p => ({ ...p, account_name: e.target.value }))}
                                className="bg-slate-800 border-slate-700"
                                placeholder="Masjid Muktamirin"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4 mt-6">
                        <p className="text-emerald-400 text-sm mb-2">Preview Tampilan:</p>
                        <p className="text-white font-medium">{settings.bank_name}</p>
                        <p className="text-xl font-mono text-emerald-300 my-1">{settings.account_number}</p>
                        <p className="text-slate-300 text-sm">a.n. {settings.account_name}</p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="save-qris-btn"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
            </div>
        </div>
    );
}
