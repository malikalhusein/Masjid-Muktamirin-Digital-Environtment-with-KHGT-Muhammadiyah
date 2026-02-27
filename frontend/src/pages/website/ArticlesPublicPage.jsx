import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, User, ChevronLeft, Search, Tag, XCircle, X, BookOpen } from 'lucide-react';
import { articleAPI, mosqueAPI } from '../../lib/api';
import { WebsiteNavigation, WebsiteFooter } from '../../components/WebsiteNavigation';

const CATEGORY_OPTIONS = [
    { value: 'semua', label: 'Semua' },
    { value: 'kegiatan', label: 'Kegiatan' },
    { value: 'pembangunan', label: 'Pembangunan' },
    { value: 'kajian', label: 'Kajian' },
    { value: 'pengumuman', label: 'Pengumuman' },
];

const CATEGORY_COLORS = {
    kegiatan: 'bg-emerald-100 text-emerald-700',
    pembangunan: 'bg-blue-100 text-blue-700',
    kajian: 'bg-purple-100 text-purple-700',
    pengumuman: 'bg-amber-100 text-amber-700',
};

export default function ArticlesPublicPage() {
    const [articles, setArticles] = useState([]);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('semua');
    const [selectedArticle, setSelectedArticle] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [articleRes, mosqueRes] = await Promise.all([
                articleAPI.getAll(true),
                mosqueAPI.getIdentity(),
            ]);
            const sorted = (articleRes.data || []).sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            setArticles(sorted);
            setMosqueIdentity(mosqueRes.data);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Close modal on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') setSelectedArticle(null); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const filtered = articles.filter((a) => {
        const matchCat = activeCategory === 'semua' || a.category === activeCategory;
        const matchSearch =
            !searchQuery ||
            a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100">
            <WebsiteNavigation mosqueIdentity={mosqueIdentity} />

            {/* Header */}
            <div className="bg-emerald-900 text-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Kembali ke Beranda
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-800 flex items-center justify-center flex-shrink-0">
                            <Newspaper className="w-7 h-7 text-emerald-300" />
                        </div>
                        <div>
                            <p className="text-emerald-400 text-sm uppercase tracking-wider">MASJID MUKTAMIRIN</p>
                            <h1 className="text-3xl md:text-4xl font-bold">Artikel & Berita</h1>
                            <p className="text-emerald-300 text-sm mt-1">{articles.length} artikel dipublikasikan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Filters */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            {CATEGORY_OPTIONS.map((cat) => (
                                <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat.value ? 'bg-emerald-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Cari artikel..." value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <XCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Articles Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((article, idx) => {
                            const createdAt = new Date(article.created_at);
                            return (
                                <motion.article
                                    key={article.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: Math.min(idx * 0.06, 0.4) }}
                                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                                    onClick={() => setSelectedArticle(article)}
                                >
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
                                        {article.image_url ? (
                                            <img src={article.image_url} alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                                                <Newspaper className="w-14 h-14 text-emerald-200" />
                                            </div>
                                        )}
                                        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-600'}`}>
                                            {article.category || 'Umum'}
                                        </span>
                                    </div>
                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <h2 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                                            {article.title}
                                        </h2>
                                        {article.excerpt && (
                                            <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">{article.excerpt}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t border-gray-50 mt-auto">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            {article.author && (
                                                <span className="flex items-center gap-1 ml-auto">
                                                    <User className="w-3.5 h-3.5" /> {article.author}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">Tidak ada artikel ditemukan</p>
                        <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
                        {(searchQuery || activeCategory !== 'semua') && (
                            <button onClick={() => { setSearchQuery(''); setActiveCategory('semua'); }}
                                className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors">
                                Reset Filter
                            </button>
                        )}
                    </div>
                )}
            </div>

            <WebsiteFooter mosqueIdentity={mosqueIdentity} />

            {/* Article Detail Modal */}
            <AnimatePresence>
                {selectedArticle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4"
                        onClick={() => setSelectedArticle(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <div className="sticky top-0 z-10 flex justify-end p-4 bg-white/80 backdrop-blur-sm">
                                <button onClick={() => setSelectedArticle(null)}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Modal image */}
                            {selectedArticle.image_url ? (
                                <div className="h-56 overflow-hidden -mt-16">
                                    <img src={selectedArticle.image_url} alt={selectedArticle.title}
                                        className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="h-32 -mt-16 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                                    <BookOpen className="w-12 h-12 text-emerald-300" />
                                </div>
                            )}

                            {/* Modal content */}
                            <div className="p-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[selectedArticle.category] || 'bg-gray-100 text-gray-600'}`}>
                                    {selectedArticle.category || 'Umum'}
                                </span>
                                <h2 className="text-2xl font-bold text-gray-800 mt-3 mb-2 leading-snug">{selectedArticle.title}</h2>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(selectedArticle.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    {selectedArticle.author && (
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" /> {selectedArticle.author}
                                        </span>
                                    )}
                                </div>
                                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                    {selectedArticle.content || selectedArticle.excerpt || 'Tidak ada konten artikel.'}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
