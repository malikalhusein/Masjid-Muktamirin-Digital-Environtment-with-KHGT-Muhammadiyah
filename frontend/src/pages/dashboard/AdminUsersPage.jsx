import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { userAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        name: '',
        password: '',
        role: 'editor'
    });

    const fetchUsers = useCallback(async () => {
        try {
            const res = await userAPI.getAll();
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Gagal memuat daftar pengguna, pastikan Anda adalah admin');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                name: user.name,
                password: '', // tidak menampilkan password lama
                role: user.role || 'editor'
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                name: '',
                password: '',
                role: 'editor'
            });
        }
        setDialogOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Jangan kirim password jika kosong (tidak diubah)
                const updateData = { name: formData.name, role: formData.role };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await userAPI.update(editingUser.id, updateData);
                toast.success('Pengguna berhasil diperbarui');
            } else {
                if (!formData.username || !formData.password || !formData.name) {
                    toast.error('Semua data wajib diisi (Username, Nama, dan Password)');
                    return;
                }
                await userAPI.create(formData);
                toast.success('Pengguna berhasil ditambahkan');
            }
            setDialogOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Gagal menyimpan data pengguna');
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        try {
            await userAPI.delete(userToDelete.id);
            toast.success('Pengguna berhasil dihapus');
            setDeleteConfirmOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Gagal menghapus pengguna');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                    <h2 className="text-2xl font-heading text-white flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-emerald-400" />
                        Administrator / Manajemen Akses
                    </h2>
                    <p className="text-slate-400">Kelola pengguna yang bisa login ke Dashboard Admin</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Tambah Pengguna
                </Button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 text-slate-400 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Username</th>
                                <th className="p-4 font-medium">Nama Lengkap</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Bergabung Pada</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{user.username}</div>
                                    </td>
                                    <td className="p-4 text-slate-300">{user.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                            }`}>
                                            {user.role === 'admin' ? 'Administrator' : 'Editor'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => confirmDelete(user)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dialog Form Pengguna */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-white">
                            {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                disabled={!!editingUser}
                                placeholder="Pilih username untuk login"
                                className="bg-slate-800 border-slate-700 text-white"
                                required={!editingUser}
                            />
                            {editingUser && <p className="text-xs text-slate-500">Username tidak dapat diubah</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nama panjang pengurus"
                                className="bg-slate-800 border-slate-700 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Hak Akses (Role)</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="editor">Editor (Manajemen Konten)</SelectItem>
                                    <SelectItem value="admin">Administrator (Super Akses)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah password" : "Buat password yang kuat"}
                                className="bg-slate-800 border-slate-700 text-white"
                                required={!editingUser}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-slate-800">
                                Batal
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                Simpan Data
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Confirm Delete */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="bg-slate-900 border-red-900/50 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-red-400">Hapus Pengguna?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Apakah Anda yakin ingin menghapus akun <strong>{userToDelete?.username}</strong>?</p>
                        <p className="text-slate-400 text-sm mt-2">Aksi ini tidak dapat dibatalkan.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)} className="hover:bg-slate-800 text-slate-300">
                            Batal
                        </Button>
                        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={userToDelete?.username === 'admin'}>
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
