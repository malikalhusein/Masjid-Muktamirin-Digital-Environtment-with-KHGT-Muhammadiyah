import { useState, useEffect } from 'react';
import { Moon, Save, Loader2, Plus, Trash2, Edit2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Empty state for a day
const emptyDayData = {
    imam_subuh: '',
    penceramah_subuh: '',
    penceramah_berbuka: '',
    imam_tarawih: '',
    penyedia_takjil: '',
    penyedia_jaburan: '',
};

// Day Input Form
const DayInputForm = ({ date, data, onChange }) => {
    const fields = [
        { key: 'imam_subuh', label: 'Imam Subuh' },
        { key: 'penceramah_subuh', label: 'Penceramah Subuh' },
        { key: 'penceramah_berbuka', label: 'Penceramah Berbuka' },
        { key: 'imam_tarawih', label: 'Imam Tarawih' },
        { key: 'penyedia_takjil', label: 'Penyedia Takjil' },
        { key: 'penyedia_jaburan', label: 'Penyedia Jaburan' },
    ];
    
    return (
        <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => (
                <div key={field.key} className="space-y-1">
                    <Label className="text-slate-300 text-sm">{field.label}</Label>
                    <Input
                        value={data[field.key] || ''}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        placeholder={`Masukkan ${field.label.toLowerCase()}`}
                        className="bg-slate-800 border-slate-700 text-white"
                    />
                </div>
            ))}
        </div>
    );
};

export default function RamadanAdminPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // February 2026
    const [ramadanSchedule, setRamadanSchedule] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Get Ramadan dates for 1447 H (Feb 17 - Mar 18, 2026)
    const ramadanStart = new Date(2026, 1, 17); // Feb 17, 2026
    const ramadanEnd = new Date(2026, 2, 18); // Mar 18, 2026
    
    useEffect(() => {
        fetchSchedule();
    }, []);
    
    const fetchSchedule = async () => {
        try {
            const res = await fetch(`${API_URL}/api/ramadan/schedule`);
            if (res.ok) {
                const data = await res.json();
                // Convert array to object keyed by date
                const scheduleMap = {};
                data.forEach(item => {
                    scheduleMap[item.date] = item;
                });
                setRamadanSchedule(scheduleMap);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSaveDay = async () => {
        if (!selectedDate) return;
        setSaving(true);
        
        const dateStr = selectedDate.toISOString().split('T')[0];
        const dayData = ramadanSchedule[dateStr] || { ...emptyDayData };
        
        try {
            const res = await fetch(`${API_URL}/api/ramadan/schedule`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ date: dateStr, ...dayData }),
            });
            
            if (res.ok) {
                toast.success('Data berhasil disimpan');
                setDialogOpen(false);
                fetchSchedule();
            } else {
                toast.error('Gagal menyimpan data');
            }
        } catch (error) {
            toast.error('Gagal menyimpan data');
        } finally {
            setSaving(false);
        }
    };
    
    const updateDayData = (field, value) => {
        if (!selectedDate) return;
        const dateStr = selectedDate.toISOString().split('T')[0];
        setRamadanSchedule(prev => ({
            ...prev,
            [dateStr]: {
                ...(prev[dateStr] || emptyDayData),
                [field]: value,
            }
        }));
    };
    
    const isRamadanDate = (date) => {
        return date >= ramadanStart && date <= ramadanEnd;
    };
    
    const getRamadanDay = (date) => {
        if (!isRamadanDate(date)) return null;
        return Math.floor((date - ramadanStart) / (1000 * 60 * 60 * 24)) + 1;
    };
    
    // Calendar generation
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        const days = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };
    
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6" data-testid="ramadan-admin-page">
            <div>
                <h1 className="font-heading text-3xl text-white flex items-center gap-3">
                    <Moon className="w-8 h-8 text-amber-400" />
                    Kelola Ramadan
                </h1>
                <p className="text-slate-400 font-body mt-1">
                    Input data imam, penceramah, dan penyedia takjil untuk setiap hari Ramadan
                </p>
            </div>
            
            {/* Info Banner */}
            <Card className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-amber-700">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <Moon className="w-10 h-10 text-amber-400" />
                        <div>
                            <h3 className="text-white font-medium">Ramadan 1447 H</h3>
                            <p className="text-amber-200 text-sm">17 Februari - 18 Maret 2026 (30 hari)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Calendar */}
            <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="font-heading text-xl text-white">
                            Kalender Ramadan
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <span className="text-white font-medium min-w-[150px] text-center">
                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </span>
                            <Button variant="ghost" size="icon" onClick={nextMonth}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                    <CardDescription className="text-slate-400">
                        Klik tanggal Ramadan untuk mengisi data kegiatan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-1">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                                {day}
                            </div>
                        ))}
                        {generateCalendarDays().map((date, index) => {
                            if (!date) return <div key={index} />;
                            
                            const isRamadan = isRamadanDate(date);
                            const ramadanDay = getRamadanDay(date);
                            const dateStr = date.toISOString().split('T')[0];
                            const hasData = ramadanSchedule[dateStr] && Object.values(ramadanSchedule[dateStr]).some(v => v && v.trim());
                            const isToday = date.toDateString() === new Date().toDateString();
                            
                            return (
                                <Dialog key={index} open={dialogOpen && selectedDate?.toDateString() === date.toDateString()} onOpenChange={(open) => {
                                    if (open && isRamadan) {
                                        setSelectedDate(date);
                                        setDialogOpen(true);
                                    } else {
                                        setDialogOpen(false);
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <button
                                            disabled={!isRamadan}
                                            className={`
                                                relative p-2 rounded-lg text-sm transition-all
                                                ${isRamadan 
                                                    ? 'bg-amber-900/30 hover:bg-amber-800/50 cursor-pointer border border-amber-800' 
                                                    : 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                                }
                                                ${isToday ? 'ring-2 ring-amber-400' : ''}
                                                ${hasData ? 'bg-emerald-900/50 border-emerald-700' : ''}
                                            `}
                                        >
                                            <span className={isRamadan ? 'text-white' : 'text-slate-600'}>
                                                {date.getDate()}
                                            </span>
                                            {ramadanDay && (
                                                <span className="block text-[10px] text-amber-400">
                                                    R{ramadanDay}
                                                </span>
                                            )}
                                            {hasData && (
                                                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
                                            )}
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="font-heading text-xl text-white flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-amber-400" />
                                                Ramadan Hari ke-{ramadanDay} ({date?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })})
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4">
                                            <DayInputForm 
                                                date={date}
                                                data={ramadanSchedule[dateStr] || emptyDayData}
                                                onChange={updateDayData}
                                            />
                                            <div className="flex justify-end gap-2 mt-6">
                                                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700">
                                                    Batal
                                                </Button>
                                                <Button onClick={handleSaveDay} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
                                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                    Simpan
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            );
                        })}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-6 mt-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-amber-900/30 border border-amber-800 rounded" />
                            <span className="text-slate-400">Hari Ramadan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-emerald-900/50 border border-emerald-700 rounded relative">
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
                            </div>
                            <span className="text-slate-400">Sudah diisi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-800/30 rounded" />
                            <span className="text-slate-400">Bukan Ramadan</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
