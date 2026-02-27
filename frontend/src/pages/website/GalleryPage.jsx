import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Images, Calendar, X, ChevronLeft, ChevronRight,
    Search, Tag, XCircle, ZoomIn,
} from 'lucide-react';
import { galleryAPI, mosqueAPI } from '../../lib/api';
import { WebsiteNavigation, WebsiteFooter } from '../../components/WebsiteNavigation';

const CATEGORY_OPTIONS = [
    { value: 'semua', label: 'Semua' },
    { value: 'umum', label: 'Umum' },
    { value: 'ramadan', label: 'Khusus Ramadan' },
    { value: 'idulfitri', label: 'Idulfitri' },
];

const CATEGORY_COLORS = {
    umum: 'bg-emerald-100 text-emerald-700',
    ramadan: 'bg-purple-100 text-purple-700',
    idulfitri: 'bg-amber-100 text-amber-700',
};

export default function GalleryPage() {
    const [galleries, setGalleries] = useState([]);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('semua');
    const [searchQuery, setSearchQuery] = useState('');

    // Lightbox
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [galleryRes, mosqueRes] = await Promise.all([
                galleryAPI.getAll(true),
                mosqueAPI.getIdentity(),
            ]);
            // Sort newest first by event_date or created_at
            const sorted = (galleryRes.data || []).sort((a, b) => {
                const dateA = new Date(a.event_date || a.created_at || 0);
                const dateB = new Date(b.event_date || b.created_at || 0);
                return dateB - dateA;
            });
            setGalleries(sorted);
            setMosqueIdentity(mosqueRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtered list — declared early so useEffect can reference it
    const filtered = galleries.filter((item) => {
        const matchCat = activeCategory === 'semua' || item.category === activeCategory;
        const matchSearch =
            !searchQuery ||
            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    const navigate = (dir) => {
        setLightboxIndex((prev) => {
            if (prev === null) return null;
            const next = (prev + dir + filtered.length) % filtered.length;
            return next;
        });
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'Escape') setLightboxIndex(null);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightboxIndex, filtered.length]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full" />
            </div>
        );
    }

    const lightboxItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

    return (
        <div className="min-h-screen bg-stone-100" data-testid="gallery-page">
            <WebsiteNavigation mosqueIdentity={mosqueIdentity} />

            {/* Header */}
            <div className="bg-emerald-900 text-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Kembali ke Beranda
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-800 flex items-center justify-center flex-shrink-0">
                            <Images className="w-7 h-7 text-emerald-300" />
                        </div>
                        <div>
                            <p className="text-emerald-400 text-sm uppercase tracking-wider">MASJID MUKTAMIRIN</p>
                            <h1 className="text-3xl md:text-4xl font-bold">Galeri Kegiatan</h1>
                            <p className="text-emerald-300 text-sm mt-1">
                                {galleries.length} foto dokumentasi kegiatan
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Filters */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Category pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            {CATEGORY_OPTIONS.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setActiveCategory(cat.value)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat.value
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari foto..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((item, idx) => (
                            <motion.div
                                key={item.id || idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.35) }}
                                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                                onClick={() => setLightboxIndex(idx)}
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                    <img
                                        src={item.image_url}
                                        alt={item.title || `Foto ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                                    </div>
                                    {/* Category badge */}
                                    {item.category && (
                                        <span className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
                                            {item.category === 'ramadan' ? 'Ramadan' : item.category === 'idulfitri' ? 'Idulfitri' : 'Umum'}
                                        </span>
                                    )}
                                </div>

                                {/* Caption */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                        {item.title || 'Kegiatan Masjid'}
                                    </h3>
                                    {item.event_date && (
                                        <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(item.event_date)}
                                        </p>
                                    )}
                                    {item.description && (
                                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <Images className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">Tidak ada foto ditemukan</p>
                        <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
                        {(searchQuery || activeCategory !== 'semua') && (
                            <button
                                onClick={() => { setSearchQuery(''); setActiveCategory('semua'); }}
                                className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                )}
            </div>

            <WebsiteFooter mosqueIdentity={mosqueIdentity} />

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center"
                        onClick={() => setLightboxIndex(null)}
                    >
                        {/* Close */}
                        <button
                            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            onClick={() => setLightboxIndex(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Counter */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                            {lightboxIndex + 1} / {filtered.length}
                        </div>

                        {/* Prev */}
                        {filtered.length > 1 && (
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Image */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center max-w-5xl w-full px-16"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={lightboxItem.image_url}
                                alt={lightboxItem.title || 'Galeri'}
                                className="max-h-[75vh] w-full object-contain rounded-xl shadow-2xl"
                            />
                            {/* Caption */}
                            <div className="mt-4 text-center text-white">
                                <h3 className="font-bold text-lg">{lightboxItem.title || 'Kegiatan Masjid'}</h3>
                                {lightboxItem.event_date && (
                                    <p className="text-sm text-emerald-300 mt-1 flex items-center justify-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(lightboxItem.event_date)}
                                    </p>
                                )}
                                {lightboxItem.description && (
                                    <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto leading-relaxed">
                                        {lightboxItem.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Next */}
                        {filtered.length > 1 && (
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}

                        {/* Thumbnail strip */}
                        {filtered.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-sm overflow-x-auto pb-1">
                                {filtered.slice(
                                    Math.max(0, lightboxIndex - 3),
                                    Math.min(filtered.length, lightboxIndex + 4)
                                ).map((item, i) => {
                                    const realIdx = Math.max(0, lightboxIndex - 3) + i;
                                    return (
                                        <button
                                            key={item.id || realIdx}
                                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(realIdx); }}
                                            className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${realIdx === lightboxIndex ? 'border-emerald-400 scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                                                }`}
                                        >
                                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
