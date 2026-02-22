import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryAPI, mosqueAPI } from '../../lib/api';
import { WebsiteNavigation, WebsiteFooter } from '../../components/WebsiteNavigation';
import { Dialog, DialogContent } from '../../components/ui/dialog';

export default function GalleryPage() {
    const [galleries, setGalleries] = useState([]);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const fetchData = useCallback(async () => {
        try {
            const [galleryRes, mosqueRes] = await Promise.all([
                galleryAPI.getAll(true),
                mosqueAPI.getIdentity()
            ]);
            setGalleries(galleryRes.data || []);
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
    
    const openLightbox = (image, index) => {
        setSelectedImage(image);
        setSelectedIndex(index);
    };
    
    const closeLightbox = () => {
        setSelectedImage(null);
    };
    
    const nextImage = () => {
        const newIndex = (selectedIndex + 1) % galleries.length;
        setSelectedIndex(newIndex);
        setSelectedImage(galleries[newIndex]);
    };
    
    const prevImage = () => {
        const newIndex = selectedIndex === 0 ? galleries.length - 1 : selectedIndex - 1;
        setSelectedIndex(newIndex);
        setSelectedImage(galleries[newIndex]);
    };
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-stone-100" data-testid="gallery-page">
            {/* Simple Header - No Navbar as requested */}
            <div className="bg-emerald-900 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link 
                        to="/homepage/about" 
                        className="inline-flex items-center gap-2 text-emerald-300 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Tentang Kami
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold">Galeri Kegiatan</h1>
                    <p className="text-emerald-300 mt-2">Dokumentasi kegiatan Masjid Muktamirin Sorogaten</p>
                </div>
            </div>
            
            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {galleries.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleries.map((item, idx) => (
                            <div 
                                key={item.id || idx}
                                onClick={() => openLightbox(item, idx)}
                                className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                            >
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img 
                                        src={item.image_url} 
                                        alt={item.title || `Galeri ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800">{item.title || 'Kegiatan Masjid'}</h3>
                                    {item.event_date && (
                                        <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(item.event_date)}
                                        </p>
                                    )}
                                    {item.description && (
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum Ada Galeri</h3>
                        <p className="text-gray-500">Dokumentasi kegiatan masjid akan ditampilkan di sini</p>
                    </div>
                )}
            </div>
            
            {/* Lightbox Modal */}
            <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
                <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
                    {selectedImage && (
                        <div className="relative">
                            {/* Close button */}
                            <button 
                                onClick={closeLightbox}
                                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            {/* Navigation */}
                            {galleries.length > 1 && (
                                <>
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                            
                            {/* Image */}
                            <img 
                                src={selectedImage.image_url} 
                                alt={selectedImage.title || 'Galeri'}
                                className="w-full max-h-[80vh] object-contain"
                            />
                            
                            {/* Caption */}
                            <div className="p-4 text-white text-center">
                                <h3 className="font-semibold text-lg">{selectedImage.title || 'Kegiatan Masjid'}</h3>
                                {selectedImage.description && (
                                    <p className="text-gray-300 mt-1">{selectedImage.description}</p>
                                )}
                                <p className="text-sm text-gray-400 mt-2">
                                    {selectedIndex + 1} / {galleries.length}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            
            {/* Simple Footer */}
            <div className="bg-emerald-950 text-white py-6 text-center">
                <p className="text-emerald-400 text-sm">
                    &copy; {new Date().getFullYear()} Masjid Muktamirin Sorogaten
                </p>
            </div>
        </div>
    );
}
