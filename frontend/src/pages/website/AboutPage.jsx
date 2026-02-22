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
    Check,
    ExternalLink,
    Clock,
    Landmark,
    Image,
    FileText
} from 'lucide-react';
import { mosqueAPI, announcementAPI, pengurusAPI, articleAPI, galleryAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { WebsiteNavigation, WebsiteFooter } from '../../components/WebsiteNavigation';

// QRIS Image URL (uploaded by user)
const QRIS_IMAGE_URL = "https://customer-assets.emergentagent.com/job_bc2fce28-e700-491a-980a-47d0af39ffe4/artifacts/tunkmt2e_QRIS%20Modif%4010x-100%20Large.jpeg";

// WhatsApp number
const WHATSAPP_NUMBER = "628121554551";

// Default mosque history text
const DEFAULT_HISTORY = `Masjid Mu'tamirin memiliki perjalanan panjang yang dimulai sejak awal abad ke-20. Sekitar tahun 1907, masjid pertama kali berdiri di daerah Josantan/Bapangan. Seiring berjalannya waktu, bangunan suci ini berpindah ke kawasan Jagan, tepatnya di rumah Ibu Warsih, yang terletak di sebelah utara lokasi masjid saat ini. Akhirnya, masjid digeser sedikit ke arah selatan hingga menetap di tempat yang kita kenal sekarang.

Tonggak penting terjadi pada 19 Juni 1977, ketika masjid menjalani renovasi besar. Dengan semangat gotong royong, jama'ah bahu-membahu mencetak bata, menebang pohon, dan mendirikan bangunan yang kokoh. Hasil kerja bersama itu menjadikan masjid berdiri megah sebagaimana kita lihat hari ini.

Masjid Mu'tamirin juga menyimpan kisah bersejarah: pernah disinggahi oleh Pangeran Diponegoro. Beliau beristirahat di rumah dekat masjid, yaitu kediaman Mbah Lurah. Hingga kini, beberapa pusaka peninggalan beliau masih tersimpan di sana, termasuk sebuah tombak yang menjadi saksi bisu perjalanan sejarah.

Sumber kisah ini berasal dari penuturan tokoh masyarakat, di antaranya R. Nur Abadi dan H. Samin Budiatmojo, yang menjaga ingatan kolektif tentang perjalanan panjang masjid.`;

// Contact Form Component - Redirect to WhatsApp
const ContactForm = () => {
    const [form, setForm] = useState({ name: '', phone: '', message: '' });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.message.trim()) {
            toast.error('Nama dan pesan harus diisi');
            return;
        }
        
        const message = encodeURIComponent(
            `Assalamu'alaikum,\n\nNama: ${form.name}\nNo. HP: ${form.phone || '-'}\n\nPesan:\n${form.message}`
        );
        const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`;
        window.open(waUrl, '_blank');
        toast.success('Membuka WhatsApp...');
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <Input 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Masukkan nama Anda"
                    required
                    data-testid="contact-name"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                <Input 
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="08xxx (opsional)"
                    data-testid="contact-phone"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan *</label>
                <Textarea 
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    placeholder="Tulis pesan Anda..."
                    rows={4}
                    required
                    data-testid="contact-message"
                />
            </div>
            <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" data-testid="contact-submit">
                <Send className="w-4 h-4 mr-2" />
                Kirim via WhatsApp
            </Button>
        </form>
    );
};

// Highlight Cards Component
const HighlightCards = () => (
    <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <Landmark className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wide">Didirikan</p>
            <p className="text-xl font-bold text-emerald-800">1907</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <Building2 className="w-6 h-6 text-amber-700 mx-auto mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wide">Renovasi Besar</p>
            <p className="text-xl font-bold text-amber-800">1977</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-blue-700 mx-auto mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wide">Terbuka</p>
            <p className="text-xl font-bold text-blue-800">24/7</p>
        </div>
    </div>
);

// Profile Section Component
const ProfileSection = ({ mosqueIdentity }) => {
    const description = mosqueIdentity?.description || DEFAULT_HISTORY;
    
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="profile-section">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">Profil Masjid Muktamirin Sorogaten</h2>
                    <p className="text-sm text-gray-500">Sejarah dan Informasi</p>
                </div>
            </div>
            
            {/* Profile Image if available */}
            {mosqueIdentity?.profile_image_url && (
                <div className="mb-4 rounded-xl overflow-hidden">
                    <img 
                        src={mosqueIdentity.profile_image_url} 
                        alt="Masjid Muktamirin"
                        className="w-full h-48 object-cover"
                    />
                </div>
            )}
            
            {/* Description with line breaks */}
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {description}
            </div>
            
            {/* Highlight Cards */}
            <HighlightCards />
        </div>
    );
};

// QRIS Section Component
const QRISSection = () => {
    const [copied, setCopied] = useState(false);
    const bankAccount = "7148254552";
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(bankAccount);
        setCopied(true);
        toast.success('Nomor rekening disalin!');
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="qris-section">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">Donasi & Infaq</h2>
                    <p className="text-sm text-gray-500">Scan QRIS atau transfer</p>
                </div>
            </div>
            
            {/* QRIS Image */}
            <div className="bg-white border-2 border-dashed border-emerald-200 rounded-xl p-4 mb-4">
                <img 
                    src={QRIS_IMAGE_URL} 
                    alt="QRIS Masjid Muktamirin"
                    className="w-full max-w-[200px] mx-auto"
                />
                <p className="text-center text-sm text-gray-500 mt-2">Scan untuk donasi infaq/zakat</p>
            </div>
            
            {/* Bank Account */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm text-emerald-800 font-medium">BSI (Bank Syariah Indonesia)</p>
                <div className="flex items-center justify-between mt-2">
                    <div>
                        <p className="text-2xl font-mono font-bold text-emerald-700">{bankAccount}</p>
                        <p className="text-xs text-emerald-600">a.n. Masjid Muktamirin</p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={copyToClipboard}
                        className="hover:bg-emerald-100"
                        data-testid="copy-account-btn"
                    >
                        {copied ? <Check className="w-5 h-5 text-emerald-700" /> : <Copy className="w-5 h-5 text-emerald-700" />}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Contact Info Section
const ContactInfoSection = ({ mosqueIdentity }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="contact-info">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
                <h2 className="font-bold text-gray-800">Informasi Kontak</h2>
                <p className="text-sm text-gray-500">Hubungi kami</p>
            </div>
        </div>
        
        <div className="space-y-4">
            <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-medium text-gray-800">WhatsApp</p>
                    <p className="text-sm text-gray-600">0812-1554-551</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto mt-1" />
            </a>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                    <p className="font-medium text-gray-800">Alamat</p>
                    <p className="text-sm text-gray-600">
                        {mosqueIdentity?.address || 'Jl. Sorogaten Dukuh, Sorogaten II, Karangsewu, Kec. Galur, Kab. Kulon Progo, DIY 55661'}
                    </p>
                </div>
            </div>
            
            <a 
                href="https://instagram.com/masjid_muktamirin_sorogaten"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
            >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                </div>
                <div>
                    <p className="font-medium text-gray-800">Instagram</p>
                    <p className="text-sm text-gray-600">@masjid_muktamirin_sorogaten</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto mt-1" />
            </a>
        </div>
    </div>
);

// Pengurus Takmir Section
const PengurusSection = ({ pengurusList }) => {
    if (!pengurusList || pengurusList.length === 0) return null;
    
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="pengurus-section">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">Pengurus Takmir</h2>
                    <p className="text-sm text-gray-500">{pengurusList[0]?.period || 'Periode Aktif'}</p>
                </div>
            </div>
            
            <div className="space-y-3">
                {pengurusList.slice(0, 6).map((pengurus, idx) => (
                    <div key={pengurus.id || idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {pengurus.photo_url ? (
                                <img src={pengurus.photo_url} alt={pengurus.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-500 font-medium">{pengurus.name?.charAt(0) || 'P'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{pengurus.name}</p>
                            <p className="text-xs text-emerald-600">{pengurus.position}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Artikel Section
const ArtikelSection = ({ articles }) => {
    if (!articles || articles.length === 0) return null;
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="artikel-section">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">Artikel & Berita</h2>
                    <p className="text-sm text-gray-500">Informasi terbaru dari masjid</p>
                </div>
            </div>
            
            <div className="space-y-3">
                {articles.slice(0, 5).map((article, idx) => (
                    <div 
                        key={article.id || idx} 
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 line-clamp-2">{article.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(article.date)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Pengumuman Section
const PengumumanSection = ({ announcements }) => {
    if (!announcements || announcements.length === 0) return null;
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="pengumuman-section">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-red-700" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">Pengumuman</h2>
                    <p className="text-sm text-gray-500">Info penting dari masjid</p>
                </div>
            </div>
            
            <div className="space-y-3">
                {announcements.slice(0, 3).map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="font-medium text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.content}</p>
                        <p className="text-xs text-red-600 mt-2">{formatDate(item.date)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Gallery Preview
const GalleryPreview = ({ galleries }) => {
    if (!galleries || galleries.length === 0) return null;
    
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="gallery-preview">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Image className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">Galeri Kegiatan</h2>
                        <p className="text-sm text-gray-500">Dokumentasi terbaru</p>
                    </div>
                </div>
                <Link to="/homepage/gallery" className="text-emerald-600 text-sm flex items-center gap-1 hover:text-emerald-700">
                    Lihat semua <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                {galleries.slice(0, 6).map((item, idx) => (
                    <Link 
                        key={item.id || idx}
                        to="/homepage/gallery"
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                        <img 
                            src={item.image_url} 
                            alt={item.title || `Galeri ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default function AboutPage() {
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [pengurusList, setPengurusList] = useState([]);
    const [articles, setArticles] = useState([]);
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('informasi');
    
    const fetchData = useCallback(async () => {
        try {
            const [mosqueRes, announcementRes, pengurusRes, articlesRes, galleryRes] = await Promise.all([
                mosqueAPI.getIdentity(),
                announcementAPI.getAll(true).catch(() => ({ data: [] })),
                pengurusAPI.getAll().catch(() => ({ data: [] })),
                articleAPI.getAll(true).catch(() => ({ data: [] })),
                galleryAPI.getAll(true).catch(() => ({ data: [] })),
            ]);
            setMosqueIdentity(mosqueRes.data);
            setAnnouncements(announcementRes.data || []);
            setPengurusList(pengurusRes.data || []);
            setArticles(articlesRes.data || []);
            setGalleries(galleryRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
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
            <WebsiteNavigation activePage="about" mosqueIdentity={mosqueIdentity} />
            
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
                {/* Profile Section */}
                <ProfileSection mosqueIdentity={mosqueIdentity} />
                
                {/* Tabs */}
                <div className="mt-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6 bg-gray-100 p-1 rounded-xl">
                            <TabsTrigger 
                                value="informasi" 
                                className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white rounded-lg py-2"
                                data-testid="tab-informasi"
                            >
                                Informasi
                            </TabsTrigger>
                            <TabsTrigger 
                                value="donasi" 
                                className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white rounded-lg py-2"
                                data-testid="tab-donasi"
                            >
                                Donasi & Infaq
                            </TabsTrigger>
                            <TabsTrigger 
                                value="kontak" 
                                className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white rounded-lg py-2"
                                data-testid="tab-kontak"
                            >
                                Kontak
                            </TabsTrigger>
                        </TabsList>
                        
                        {/* Informasi Tab */}
                        <TabsContent value="informasi" className="mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <ArtikelSection articles={articles} />
                                    <PengumumanSection announcements={announcements} />
                                    <GalleryPreview galleries={galleries} />
                                </div>
                                <div className="space-y-6">
                                    <PengurusSection pengurusList={pengurusList} />
                                </div>
                            </div>
                        </TabsContent>
                        
                        {/* Donasi Tab */}
                        <TabsContent value="donasi" className="mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                <QRISSection />
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-emerald-700" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-800">Infaq Terbuka</h2>
                                            <p className="text-sm text-gray-500">Setiap donasi adalah amal jariyah</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 text-sm text-gray-600">
                                        <p>
                                            Masjid Mu'tamirin menerima infaq dari berbagai sumber untuk mendukung kegiatan dakwah, pembangunan, dan kesejahteraan jamaah.
                                        </p>
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <p className="font-medium text-amber-800 mb-2">Program Infaq:</p>
                                            <ul className="space-y-1 text-amber-700">
                                                <li>• Infaq Operasional Masjid</li>
                                                <li>• Infaq Pembangunan & Renovasi</li>
                                                <li>• Infaq Kegiatan Dakwah</li>
                                                <li>• Zakat Fitrah & Maal</li>
                                                <li>• Sedekah Umum</li>
                                            </ul>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Laporan keuangan dapat dilihat di halaman <Link to="/homepage/informasi" className="text-emerald-600 hover:underline">Informasi ZIS</Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        
                        {/* Kontak Tab */}
                        <TabsContent value="kontak" className="mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <Send className="w-5 h-5 text-emerald-700" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-gray-800">Kirim Pesan</h2>
                                                <p className="text-sm text-gray-500">Akan diteruskan via WhatsApp</p>
                                            </div>
                                        </div>
                                        <ContactForm />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <ContactInfoSection mosqueIdentity={mosqueIdentity} />
                                    <PengurusSection pengurusList={pengurusList} />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            
            <WebsiteFooter mosqueIdentity={mosqueIdentity} />
        </div>
    );
}
