'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ShoppingBag, X, Check, AlertCircle } from 'lucide-react';

interface StoreItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: 'Aircraft' | 'Badge' | 'Perk' | 'Other';
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
        setEditing(null);
        setError(null);
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
        } else {
            resetForm();
        }
        setShowModal(true);
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
                <div className="glass-card overflow-hidden">
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
                                        <p className="text-white font-medium">{item.name}</p>
                                        <p className="text-gray-500 text-xs truncate max-w-xs">{item.description}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-dark-700 px-2 py-1 rounded text-xs text-gray-300">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-accent-gold font-mono font-bold">
                                        {item.price.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        {item.active ? (
                                            <span className="text-green-500 flex items-center gap-1 text-xs">
                                                <Check className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="text-red-500 flex items-center gap-1 text-xs">
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
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 rounded-xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">
                                {editing ? 'Edit Item' : 'Add New Item'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Item Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    placeholder="Enter item name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Price (Points)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        className="w-full bg-dark-700 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors font-mono"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value as any)}
                                        className="w-full bg-dark-700 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    >
                                        <option value="Aircraft">Aircraft</option>
                                        <option value="Badge">Badge</option>
                                        <option value="Perk">Perk</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors resize-none"
                                    placeholder="Item description..."
                                />
                            </div>

                            <div>
                                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Download URL / Livery Link</label>
                                <input
                                    type="text"
                                    value={downloadUrl}
                                    onChange={e => setDownloadUrl(e.target.value)}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={active}
                                    onChange={e => setActive(e.target.checked)}
                                    className="w-4 h-4 rounded bg-dark-700 border-white/10 text-accent-gold"
                                />
                                <label htmlFor="active" className="text-gray-300 text-sm">Active & Visible in Store</label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-dark-900/50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary px-8 py-2 flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {editing ? 'Update Item' : 'Create Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
