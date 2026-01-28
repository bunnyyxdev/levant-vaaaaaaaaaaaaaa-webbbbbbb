'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, CheckCircle, AlertCircle, Package, ArrowRight } from 'lucide-react';

interface StoreItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    download_url?: string;
    active: boolean;
}

export default function StorePage() {
    const [items, setItems] = useState<StoreItem[]>([]);
    const [balance, setBalance] = useState(0);
    const [ownedItems, setOwnedItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const fetchStoreData = async () => {
        try {
            const res = await fetch('/api/store');
            const data = await res.json();
            if (res.ok) {
                setItems(data.items || []);
                setBalance(data.balance || 0);
                setOwnedItems(data.ownedItems || []);
            }
        } catch (error) {
            console.error('Failed to fetch store data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreData();
    }, []);

    const handlePurchase = async (itemId: string) => {
        setPurchasing(itemId);
        setMessage(null);
        try {
            const res = await fetch('/api/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: data.message, type: 'success' });
                setBalance(data.newBalance);
                setOwnedItems([...ownedItems, itemId]);
            } else {
                setMessage({ text: data.error, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Failed to process purchase', type: 'error' });
        } finally {
            setPurchasing(null);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Aircraft': return 'text-blue-400 bg-blue-500/20';
            case 'Badge': return 'text-purple-400 bg-purple-500/20';
            case 'Perk': return 'text-green-400 bg-green-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-accent-gold" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Pilot Store</h1>
                        <p className="text-gray-400">Upgrade your experience with points</p>
                    </div>
                </div>
                <div className="bg-dark-700 rounded-xl px-6 py-3 border border-accent-gold/20 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Available Points</p>
                        <p className="text-2xl font-bold text-accent-gold font-mono">{balance.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-accent-gold" />
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                    message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {loading ? (
                <div className="glass-card p-12 text-center text-gray-400">Loading store items...</div>
            ) : items.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No items available in the store yet</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item._id} className="glass-card overflow-hidden group flex flex-col">
                            {/* Item Header / Image Placeholder */}
                            <div className="h-32 bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center relative border-b border-white/5">
                                {item.category === 'Aircraft' ? (
                                    <span className="text-5xl group-hover:scale-110 transition-transform">✈️</span>
                                ) : item.category === 'Badge' ? (
                                    <span className="text-5xl group-hover:scale-110 transition-transform">🎖️</span>
                                ) : (
                                    <span className="text-5xl group-hover:scale-110 transition-transform">📦</span>
                                )}
                                <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${getCategoryColor(item.category)}`}>
                                    {item.category}
                                </div>
                            </div>

                            {/* Item Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-1">{item.description}</p>
                                
                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-[10px] uppercase tracking-wider">Price</span>
                                        <span className="text-xl font-bold text-accent-gold font-mono">{item.price.toLocaleString()}</span>
                                    </div>

                                    {ownedItems.includes(item._id) ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold">
                                                <CheckCircle className="w-4 h-4" />
                                                Owned
                                            </div>
                                            {item.download_url && (
                                                <a
                                                    href={item.download_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all text-center"
                                                >
                                                    Download Content
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(item._id)}
                                            disabled={purchasing === item._id || balance < item.price}
                                            className="bg-accent-gold text-dark-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent-gold/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {purchasing === item._id ? (
                                                <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    Buy Now
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
