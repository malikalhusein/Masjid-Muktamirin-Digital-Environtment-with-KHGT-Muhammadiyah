import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    Phone, 
    Mail, 
    MapPin,
    Send,
    QrCode,
    Building2,
    Users,
    Heart,
    Bell,
    Calendar,
    ChevronRight,
    Copy,
    Check
} from 'lucide-react';
import { mosqueAPI, announcementAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

// Navigation component (consistent with other pages)
const Navigation = ({ activePage = 'about' }) => (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <Link to="/homepage" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center border-2 border-emerald-700">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div>
                        <span className="font-bold text-gray-800">Muktamirin</span>
                        <p className="text-xs text-emerald-600">Sorogaten</p>
                    </div>
                </Link>
                <div className="hidden md:flex items-center gap-1">
                    {[
                        { path: '/homepage', label: 'Home', key: 'home' },
                        { path: '/homepage/agenda', label: 'Agenda', key: 'agenda' },
                        { path: '/ramadan', label: 'Ramadan', key: 'ramadan' },
                        { path: '/homepage/about', label: 'Tentang Kami', key: 'about' },
                    ].map((item) => (
                        <Link
                            key={item.key}
                            to={item.path}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activePage === item.key
                                    ? 'bg-emerald-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    </nav>
);

// Footer component (consistent with other pages)
const Footer = ({ mosqueIdentity }) => (
    <footer className="bg-emerald-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="font-heading text-xl font-bold mb-4">Masjid Muktamirin</h3>
                    <p className="text-emerald-200 text-sm mb-4">Sorogaten, Galur, Kulon Progo</p>
                    <div className="space-y-2 text-sm text-emerald-300">
                        <p className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            Jl. Sorogaten Dukuh, Sorogaten II, Karangsewu, Kec. Galur, Kab. Kulon Progo, DIY 55661
                        </p>
                        <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            0812-1554-551
                        </p>
                    </div>
                </div>
                <div>
                    <h3 className="font-heading text-lg font-bold mb-4">Navigasi</h3>
                    <ul className="space-y-2 text-sm text-emerald-200">
                        <li><Link to="/homepage" className="hover:text-white transition-colors">Jadwal Sholat</Link></li>
                        <li><Link to="/homepage/agenda" className="hover:text-white transition-colors">Kalender Kegiatan</Link></li>
                        <li><Link to="/ramadan" className="hover:text-white transition-colors">Ramadan</Link></li>
                        <li><Link to="/homepage/about" className="hover:text-white transition-colors">Donasi & Infaq</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading text-lg font-bold mb-4">Infaq & Donasi</h3>
                    <p className="text-emerald-200 text-sm mb-4">
                        Salurkan infaq dan sedekah Anda untuk kemakmuran masjid dan kegiatan dakwah.
                    </p>
                    <div className="bg-emerald-900/50 rounded-lg p-4 border border-emerald-800">
                        <p className="font-medium text-sm">BSI (Bank Syariah Indonesia)</p>
                        <p className="text-lg font-mono text-emerald-300 my-1">XXX-XXXX-XXX</p>
                        <p className="text-xs text-emerald-400">a.n. Masjid Muktamirin</p>
                    </div>
                </div>
            </div>
            <div className="border-t border-emerald-800 mt-8 pt-8 text-center text-emerald-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Masjid Muktamirin Sorogaten. Hak cipta dilindungi.</p>
            </div>
        </div>
    </footer>
);

// Contact Form Component
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
        // Simulate sending (can be replaced with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setSending(false);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
            <div>
                <Input 
                    placeholder="Nama Lengkap *" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white border-gray-200 focus:border-emerald-500"
                    data-testid="contact-name-input"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                    type="email"
                    placeholder="Email" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white border-gray-200 focus:border-emerald-500"
                    data-testid="contact-email-input"
                />
                <Input 
                    placeholder="No. HP" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-white border-gray-200 focus:border-emerald-500"
                    data-testid="contact-phone-input"
                />
            </div>
            <Textarea 
                placeholder="Tulis pesan Anda di sini... *" 
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="bg-white border-gray-200 focus:border-emerald-500 resize-none"
                data-testid="contact-message-input"
            />
            <Button 
                type="submit" 
                disabled={sending} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="contact-submit-btn"
            >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Mengirim...' : 'Kirim Pesan'}
            </Button>
        </form>
    );
};

// QRIS Donation Section
const QRISSection = () => {
    const [copied, setCopied] = useState(false);
    const bankAccount = 'XXX-XXXX-XXX';
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(bankAccount.replace(/-/g, ''));
        setCopied(true);
        toast.success('Nomor rekening disalin!');
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6" data-testid="qris-section">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">Donasi & Infaq</h2>
                    <p className="text-sm text-gray-500">Scan QRIS atau transfer manual</p>
                </div>
            </div>
            
            {/* QRIS Code Placeholder */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center mb-6">
                <div className="bg-white rounded-lg p-6 border-2 border-dashed border-emerald-300 inline-block mb-4">
                    <QrCode className="w-32 h-32 text-emerald-600 mx-auto" />
                    <p className="text-xs text-gray-400 mt-2">QRIS akan ditampilkan di sini</p>
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Infaq Masjid</span>
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">Zakat</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Sedekah</span>
                </div>
            </div>
            
            {/* Bank Transfer */}
            <div className="border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500 mb-3">Atau transfer ke rekening:</p>
                <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-emerald-600 font-medium">BSI (Bank Syariah Indonesia)</p>
                            <p className="text-xl font-mono font-bold text-gray-800">{bankAccount}</p>
                            <p className="text-sm text-gray-500">a.n. Masjid Muktamirin</p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={copyToClipboard}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                            data-testid="copy-account-btn"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Pengumuman Card Component
const PengumumanCard = ({ pengumuman }) => {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow" data-testid="pengumuman-card">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{pengumuman.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{pengumuman.content}</p>
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(pengumuman.created_at)}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Pengumuman Section
const PengumumanSection = ({ announcements }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6" data-testid="pengumuman-section">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">Pengumuman</h2>
                    <p className="text-sm text-gray-500">Informasi terbaru dari masjid</p>
                </div>
            </div>
        </div>
        
        {announcements.length > 0 ? (
            <div className="space-y-3">
                {announcements.map((item, idx) => (
                    <PengumumanCard key={item.id || idx} pengumuman={item} />
                ))}
            </div>
        ) : (
            <div className="text-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada pengumuman terbaru</p>
            </div>
        )}
    </div>
);

// Profile Section
const ProfileSection = ({ mosqueIdentity }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6" data-testid="profile-section">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
                <h2 className="font-bold text-gray-800">Profil Masjid</h2>
                <p className="text-sm text-gray-500">Tentang Masjid Muktamirin</p>
            </div>
        </div>
        
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-2xl text-emerald-800">{mosqueIdentity?.name || 'Masjid Muktamirin'}</h3>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {mosqueIdentity?.address || 'Sorogaten, Galur, Kulon Progo'}
                </p>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
                Masjid Muktamirin adalah masjid yang berlokasi di Dusun Sorogaten, Desa Karangsewu, 
                Kecamatan Galur, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta. 
                Masjid ini menjadi pusat kegiatan ibadah dan dakwah bagi masyarakat sekitar, 
                menyelenggarakan berbagai program keagamaan sepanjang tahun.
            </p>
            
            <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">5</p>
                    <p className="text-xs text-gray-500">Waktu Sholat</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">1447</p>
                    <p className="text-xs text-gray-500">Tahun Hijriyah</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">24/7</p>
                    <p className="text-xs text-gray-500">Terbuka</p>
                </div>
            </div>
        </div>
    </div>
);

// Contact Section
const ContactSection = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6" data-testid="contact-section">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-700" />
            </div>
            <div>
                <h2 className="font-bold text-gray-800">Hubungi Kami</h2>
                <p className="text-sm text-gray-500">Kirim pesan atau pertanyaan</p>
            </div>
        </div>
        
        {/* Contact Info */}
        <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-emerald-600" />
                <div>
                    <p className="text-xs text-gray-500">Telepon / WhatsApp</p>
                    <p className="font-medium text-gray-800">0812-1554-551</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-emerald-600" />
                <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">info@masjidmuktamirin.web.id</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <div>
                    <p className="text-xs text-gray-500">Alamat</p>
                    <p className="font-medium text-gray-800 text-sm">Jl. Sorogaten Dukuh, Sorogaten II, Karangsewu, Galur, Kulon Progo, DIY</p>
                </div>
            </div>
        </div>
        
        {/* Contact Form */}
        <div className="border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500 mb-4">Atau kirim pesan langsung:</p>
            <ContactForm />
        </div>
    </div>
);

// Pengurus Section
const PengurusSection = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6" data-testid="pengurus-section">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-700" />
            </div>
            <div>
                <h2 className="font-bold text-gray-800">Struktur Pengurus</h2>
                <p className="text-sm text-gray-500">Takmir Masjid Muktamirin</p>
            </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { jabatan: 'Ketua Takmir', nama: 'Bpk. [Nama]' },
                { jabatan: 'Wakil Ketua', nama: 'Bpk. [Nama]' },
                { jabatan: 'Sekretaris', nama: 'Bpk. [Nama]' },
                { jabatan: 'Bendahara', nama: 'Bpk. [Nama]' },
            ].map((pengurus, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-emerald-50 transition-colors">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="font-medium text-gray-800 text-sm">{pengurus.nama}</p>
                    <p className="text-xs text-gray-500">{pengurus.jabatan}</p>
                </div>
            ))}
        </div>
    </div>
);

export default function AboutPage() {
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        try {
            const [mosqueRes, announcementRes] = await Promise.all([
                mosqueAPI.getIdentity(),
                announcementAPI?.getAll?.() || Promise.resolve({ data: [] })
            ]);
            setMosqueIdentity(mosqueRes.data);
            // Use mock data if API not available
            const mockAnnouncements = [
                { id: '1', title: 'Jadwal Sholat Jumat', content: 'Khatib Jumat pekan ini adalah Ustadz Ahmad. Jamaah diharapkan hadir 15 menit sebelum khutbah.', created_at: new Date().toISOString() },
                { id: '2', title: 'Pengajian Rutin Ahad Pagi', content: 'Pengajian rutin setiap Ahad pagi pukul 06.00 WIB setelah Subuh. Tema: Fiqih Ibadah.', created_at: new Date(Date.now() - 86400000).toISOString() },
                { id: '3', title: 'Donasi Pembangunan Masjid', content: 'Donasi untuk renovasi lantai 2 masjid masih dibuka. Salurkan melalui QRIS atau rekening BSI.', created_at: new Date(Date.now() - 172800000).toISOString() },
            ];
            setAnnouncements(announcementRes?.data?.length ? announcementRes.data : mockAnnouncements);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Set mock announcements on error
            setAnnouncements([
                { id: '1', title: 'Jadwal Sholat Jumat', content: 'Khatib Jumat pekan ini adalah Ustadz Ahmad. Jamaah diharapkan hadir 15 menit sebelum khutbah.', created_at: new Date().toISOString() },
                { id: '2', title: 'Pengajian Rutin Ahad Pagi', content: 'Pengajian rutin setiap Ahad pagi pukul 06.00 WIB setelah Subuh. Tema: Fiqih Ibadah.', created_at: new Date(Date.now() - 86400000).toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);
    
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-stone-100" data-testid="about-page">
            <Navigation activePage="about" />
            
            {/* Header */}
            <div className="bg-emerald-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-emerald-400 text-sm uppercase tracking-wider mb-2">MASJID MUKTAMIRIN</p>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Tentang Kami</h1>
                    <p className="text-emerald-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Sorogaten, Galur, Kulon Progo, DIY
                    </p>
                </div>
            </div>
            
            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile & Pengumuman */}
                    <div className="lg:col-span-2 space-y-6">
                        <ProfileSection mosqueIdentity={mosqueIdentity} />
                        <PengumumanSection announcements={announcements} />
                        <PengurusSection />
                    </div>
                    
                    {/* Right Column - QRIS & Contact */}
                    <div className="space-y-6">
                        <QRISSection />
                        <ContactSection />
                    </div>
                </div>
            </div>
            
            <Footer mosqueIdentity={mosqueIdentity} />
        </div>
    );
}
