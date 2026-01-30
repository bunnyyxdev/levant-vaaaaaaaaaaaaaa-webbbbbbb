'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, ShoppingBag, X, Check, AlertCircle, Upload, FileText, Image as ImageIcon, Loader2, Package } from 'lucide-react';
import { upload } from '@vercel/blob/client';

interface StoreItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: 'Aircraft' | 'Badge' | 'Perk' | 'Skin' | 'Other';
    active: boolean;
    image?: string;
    download_url?: string;
}

export default function AdminStorePage() {
    const [items, setItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<StoreItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<StoreItem['category']>('Other');
    const [active, setActive] = useState(true);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/store');
            const data = await res.json();
            if (res.ok) {
                setItems(data.items || []);
            }
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setCategory('Other');
        setActive(true);
        setDownloadUrl('');
        setImageUrl('');
        setEditing(null);
        setError(null);
        setUploadProgress(0);
    };

    const handleOpenModal = (item?: StoreItem) => {
        if (item) {
            setEditing(item);
            setName(item.name);
            setDescription(item.description);
            setPrice(item.price.toString());
            setCategory(item.category);
            setActive(item.active);
            setDownloadUrl(item.download_url || '');
            setImageUrl(item.image || '');
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'zip' | 'image') => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation
        if (type === 'zip' && !file.name.endsWith('.zip')) {
            setError('Please upload a .zip file for skins');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/admin/acars/upload/token',
                onUploadProgress: (progressEvent) => {
                    setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
                }
            });

            if (type === 'zip') {
                setDownloadUrl(newBlob.url);
            } else {
                setImageUrl(newBlob.url);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError('File upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSave = async () => {
        if (!name || !description || !price) {
            setError('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            const body = {
                ...(editing && { id: editing._id }),
                name,
                description,
                price: parseInt(price),
                category,
                active,
                download_url: downloadUrl,
                image: imageUrl,
            };

            const res = await fetch('/api/admin/store', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowModal(false);
                fetchItems();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save item');
            }
        } catch (error) {
            setError('Connection error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        try {
            const res = await fetch(`/api/admin/store?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchItems();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-accent-gold" />
                    <h1 className="text-2xl font-bold text-white">Store Management</h1>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Item
                </button>
            </div>

            {loading ? (
                <div className="glass-card p-12 text-center text-gray-400">Loading store items...</div>
            ) : (
                <div className="glass-card overflow-hidden border border-white/5 shadow-2xl">
                    <table className="w-full">
                        <thead className="bg-dark-700">
                            <tr className="text-left text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4">Item</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.map((item) => (
                                <tr key={item._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover border border-white/10" />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-dark-700 flex items-center justify-center text-gray-500">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-white font-medium">{item.name}</p>
                                                <p className="text-gray-500 text-xs truncate max-w-xs">{item.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-dark-700 px-2 py-1 rounded text-xs text-gray-300 border border-white/5">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-accent-gold font-mono font-bold">
                                        {item.price.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        {item.active ? (
                                            <span className="text-emerald-500 flex items-center gap-1 text-xs">
                                                <Check className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="text-rose-500 flex items-center gap-1 text-xs">
                                                <X className="w-3 h-3" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-2 text-gray-400 hover:text-accent-gold transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-dark-800 rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-900/50">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {editing ? <Edit className="w-5 h-5 text-accent-gold" /> : <Plus className="w-5 h-5 text-accent-gold" />}
                                {editing ? 'Edit Item' : 'Add New Item'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto flex-1">
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-3 animate-in shake duration-300">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1.5 ml-1">Item Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                            placeholder="Elegant Modern UI"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1.5 ml-1">Price</label>
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={e => setPrice(e.target.value)}
                                                className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors font-mono"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1.5 ml-1">Category</label>
                                            <select
                                                value={category}
                                                onChange={e => setCategory(e.target.value as any)}
                                                className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                            >
                                                <option value="Aircraft">Aircraft</option>
                                                <option value="Badge">Badge</option>
                                                <option value="Perk">Perk</option>
                                                <option value="Skin">Skins (ACARS)</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1.5 ml-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            rows={4}
                                            className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors resize-none"
                                            placeholder="Detailed description of the item..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1.5 ml-1">Thumbnail Image</label>
                                        <div className="relative group cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                                            <div className="w-full h-32 rounded-xl bg-dark-700 border border-white/5 overflow-hidden flex items-center justify-center transition-all group-hover:border-accent-gold/40">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-accent-gold transition-colors">
                                                        <ImageIcon size={32} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Click to Upload</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isUploading && uploadProgress > 0 && (
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                                                    <Loader2 className="animate-spin" />
                                                    {uploadProgress}%
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={imageInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => handleFileUpload(e, 'image')}
                                        />
                                        <input 
                                            type="text" 
                                            value={imageUrl} 
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="mt-2 w-full bg-dark-900/50 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-400 font-mono"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {/* Content Link / Zip Upload */}
                                    <div>
                                        <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1.5 ml-1">
                                            {category === 'Skin' ? 'Skin Package (.ZIP)' : 'Download Content / Info Link'}
                                        </label>
                                        
                                        <div className="space-y-3">
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="w-full py-4 rounded-xl bg-accent-gold/5 border border-dashed border-accent-gold/20 hover:bg-accent-gold/10 hover:border-accent-gold/40 transition-all flex flex-col items-center gap-2 text-accent-gold disabled:opacity-50"
                                            >
                                                {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    {isUploading ? `Uploading ${uploadProgress}%` : `Upload ${category === 'Skin' ? 'Skin Zip' : 'Content File'}`}
                                                </span>
                                            </button>

                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                    <FileText size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={downloadUrl}
                                                    onChange={e => setDownloadUrl(e.target.value)}
                                                    className="w-full bg-dark-700 border border-white/5 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors text-xs font-mono"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept={category === 'Skin' ? ".zip" : "*"} 
                                            onChange={(e) => handleFileUpload(e, 'zip')}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-dark-900/50 rounded-xl border border-white/5">
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id="active"
                                                checked={active}
                                                onChange={e => setActive(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-dark-700 border border-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </div>
                                        <label htmlFor="active" className="text-gray-300 text-sm font-bold">Active & Published</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-4 bg-dark-900/50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors font-bold text-sm"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || isUploading}
                                className="bg-accent-gold text-dark-950 px-10 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-accent-gold/10"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin text-dark-950" /> : <Check className="w-4 h-4" />}
                                {editing ? 'Apply Changes' : 'Launch Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
