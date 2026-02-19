import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    ChevronLeft, 
    Moon, 
    ExternalLink, 
    Phone, 
    Mail, 
    MapPin,
    Send,
    QrCode,
    Building2,
    Users,
    Heart
} from 'lucide-react';
import { mosqueAPI } from '../../lib/api';
import { isRamadan } from '../../lib/khgtCalendar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

// Contact Form
const ContactForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [sending, setSending] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.message) {
            toast.error('Nama dan pesan harus diisi');
            return;
        }
        setSending(true);
        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Pesan berhasil dikirim!');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setSending(false);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Input 
                    placeholder="Nama Lengkap *" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white border-gray-200"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    type="email"
                    placeholder="Email" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white border-gray-200"
                />
                <Input 
                    placeholder="No. HP" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-white border-gray-200"
                />
            </div>
            <Textarea 
                placeholder="Pesan Anda *" 
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="bg-white border-gray-200"
            />
            <Button type="submit" disabled={sending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Mengirim...' : 'Kirim Pesan'}
            </Button>
        </form>
    );
};

// QRIS Placeholder
const QRISSection = () => (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center">
        <QrCode className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Donasi via QRIS</h3>
        <p className="text-gray-500 text-sm mb-4">Scan QR Code untuk infaq, zakat, atau sedekah</p>
        <div className="bg-white rounded-lg p-4 border-2 border-dashed border-emerald-300 mb-4">
            <p className="text-gray-400 text-sm">[QRIS Code Placeholder]</p>
            <p className="text-xs text-gray-400 mt-2">Akan ditampilkan setelah dikonfigurasi admin</p>
        </div>
        <div className="flex justify-center gap-4 text-sm">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">Infaq</span>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Zakat</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Sedekah</span>
        </div>
    </div>
);

// Pengurus Section
const PengurusSection = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
            { jabatan: 'Ketua Takmir', nama: '[Nama Ketua]' },
            { jabatan: 'Sekretaris', nama: '[Nama Sekretaris]' },
            { jabatan: 'Bendahara', nama: '[Nama Bendahara]' },
            { jabatan: 'Sie. Dakwah', nama: '[Nama Sie Dakwah]' },
        ].map((pengurus, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-medium text-gray-800">{pengurus.nama}</p>
                <p className="text-sm text-gray-500">{pengurus.jabatan}</p>
            </div>
        ))}
    </div>
);

export default function AboutPage() {
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        try {
            const res = await mosqueAPI.getIdentity();
            setMosqueIdentity(res.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => { fetchData(); }, [fetchData]);
    
    const inRamadan = isRamadan(new Date());
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50" data-testid="about-page">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            {mosqueIdentity?.logo_url ? (
                                <img src={mosqueIdentity.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                                    <span className="font-arabic text-white text-lg">م</span>
                                </div>
                            )}
                            <span className="font-bold text-gray-800">{mosqueIdentity?.name || 'Masjid Muktamirin'}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/homepage" className="text-gray-600 hover:text-emerald-600">Home</Link>
                            <Link to="/homepage/agenda" className="text-gray-600 hover:text-emerald-600">Agenda</Link>
                            {inRamadan && <Link to="/ramadan" className="text-amber-600 hover:text-amber-700 flex items-center gap-1"><Moon className="w-4 h-4" />Ramadan</Link>}
                            <Link to="/homepage/about" className="text-emerald-600 font-medium">Tentang Kami</Link>
                            <Link to="/" target="_blank" className="text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                <ExternalLink className="w-4 h-4" />TV Display
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            
            {/* Header */}
            <div className="bg-emerald-700 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/homepage" className="inline-flex items-center gap-1 text-emerald-200 hover:text-white mb-4">
                        <ChevronLeft className="w-4 h-4" /> Kembali ke Home
                    </Link>
                    <h1 className="text-3xl font-bold">Tentang Kami</h1>
                    <p className="text-emerald-200 mt-2">Informasi, kontak, dan donasi</p>
                </div>
            </div>
            
            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* About Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Building2 className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-xl font-semibold text-gray-800">Profil Masjid</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-2xl text-emerald-700">{mosqueIdentity?.name || 'Masjid Muktamirin'}</h3>
                                <p className="text-gray-500">{mosqueIdentity?.address || 'Galur, Kulon Progo'}</p>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Masjid Muktamirin adalah masjid yang berlokasi di Dusun Sorogaten, Desa Karangsewu, Kecamatan Galur, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta. 
                                Masjid ini menjadi pusat kegiatan ibadah dan dakwah bagi masyarakat sekitar.
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-emerald-600">1447 H</p>
                                    <p className="text-sm text-gray-500">Tahun Hijriyah</p>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-emerald-600">5</p>
                                    <p className="text-sm text-gray-500">Waktu Sholat</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Phone className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-xl font-semibold text-gray-800">Kontak</h2>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Telepon</p>
                                    <p className="font-medium text-gray-800">+62 xxx xxxx xxxx</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-800">info@masjidmuktamirin.web.id</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Alamat</p>
                                    <p className="font-medium text-gray-800">{mosqueIdentity?.address || 'Sorogaten II, Karangsewu, Galur, Kulon Progo'}</p>
                                </div>
                            </div>
                        </div>
                        <ContactForm />
                    </div>
                </div>
                
                {/* Pengurus Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Struktur Pengurus</h2>
                    </div>
                    <PengurusSection />
                </div>
                
                {/* Donation Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <QRISSection />
                    
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart className="w-6 h-6 text-rose-500" />
                            <h2 className="text-xl font-semibold text-gray-800">Laporan Donasi</h2>
                        </div>
                        <div className="text-center py-8">
                            <p className="text-gray-400">Laporan infaq dan zakat akan ditampilkan di sini</p>
                            <p className="text-sm text-gray-300 mt-2">(Coming soon)</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <footer className="bg-emerald-900 text-white py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-emerald-300 text-sm">&copy; {new Date().getFullYear()} {mosqueIdentity?.name || 'Masjid Muktamirin'}. Jam Sholat Digital KHGT Muhammadiyah.</p>
                </div>
            </footer>
        </div>
    );
}
