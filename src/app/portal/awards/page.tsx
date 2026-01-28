'use client';
import { useState, useEffect } from 'react';
import { Award, Trophy, Check } from 'lucide-react';

export default function AwardsPage() {
    const [awards, setAwards] = useState<any[]>([]);
    const [myAwards, setMyAwards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [awardsRes, myRes] = await Promise.all([
                fetch('/api/awards'),
                fetch('/api/awards/my')
            ]);
            
            const awardsData = await awardsRes.json();
            const myData = await myRes.json().catch(() => []);
            
            setAwards(awardsData);
            setMyAwards(Array.isArray(myData) ? myData : []);
        } catch (err) {
            console.error('Error fetching awards:', err);
        } finally {
            setLoading(false);
        }
    };

    const earnedAwardIds = myAwards.map((pa: any) => 
        pa.award_id?._id?.toString() || pa.award_id?.toString()
    );

    const isEarned = (awardId: string) => earnedAwardIds.includes(awardId);

    const getEarnedDate = (awardId: string) => {
        const pa = myAwards.find((p: any) => 
            (p.award_id?._id?.toString() || p.award_id?.toString()) === awardId
        );
        return pa?.earned_at ? new Date(pa.earned_at).toLocaleDateString() : null;
    };

    const filteredAwards = awards.filter((award: any) => {
        if (filter === 'earned') return isEarned(award._id);
        if (filter === 'locked') return !isEarned(award._id);
        return true;
    });

    // Group by category
    const categories = [...new Set(awards.map((a: any) => a.category || 'General'))];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <Trophy className="w-10 h-10 text-accent-gold" />
                    Our Awards
                </h1>
                <div className="divider mx-auto" />
                <p className="text-gray-400 max-w-2xl mx-auto">
                    At Levant Virtual Airlines, we are proud to recognize our pilots for their commitment 
                    to excellence in the virtual aviation community. Earn badges by flying, completing tours, 
                    and achieving milestones!
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-white">{awards.length}</div>
                    <div className="text-xs text-gray-400">Total Awards</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{myAwards.length}</div>
                    <div className="text-xs text-gray-400">Earned</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-gray-500">{awards.length - myAwards.length}</div>
                    <div className="text-xs text-gray-400">Locked</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center gap-2">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'all' 
                            ? 'bg-accent-gold text-dark-900' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                >
                    All ({awards.length})
                </button>
                <button 
                    onClick={() => setFilter('earned')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'earned' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                >
                    Earned ({myAwards.length})
                </button>
                <button 
                    onClick={() => setFilter('locked')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'locked' 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                >
                    Locked ({awards.length - myAwards.length})
                </button>
            </div>

            {/* Awards by Category */}
            {categories.map(category => {
                const categoryAwards = filteredAwards.filter((a: any) => 
                    (a.category || 'General') === category
                );
                
                if (categoryAwards.length === 0) return null;

                return (
                    <div key={category} className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-accent-gold" />
                            {category}
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryAwards.map((award: any) => {
                                const earned = isEarned(award._id);
                                const earnedDate = getEarnedDate(award._id);
                                
                                return (
                                    <div 
                                        key={award._id} 
                                        className={`glass-card p-4 flex gap-4 transition-all ${
                                            earned 
                                                ? 'ring-2 ring-green-500/50' 
                                                : 'opacity-60 grayscale hover:opacity-80 hover:grayscale-0'
                                        }`}
                                    >
                                        {/* Award Image */}
                                        <div className="flex-shrink-0">
                                            {award.imageUrl ? (
                                                <img 
                                                    src={`/img/award/${award.imageUrl}`}
                                                    alt={award.name}
                                                    className="w-16 h-16 object-contain"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-dark-700 rounded-lg flex items-center justify-center">
                                                    <Award className="w-8 h-8 text-accent-gold" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Award Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-white truncate">{award.name}</h3>
                                                {earned && (
                                                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        EARNED
                                                    </span>
                                                )}
                                            </div>
                                            {award.description && (
                                                <p className="text-gray-400 text-sm line-clamp-2">{award.description}</p>
                                            )}
                                            {award.criteria && (
                                                <p className="text-xs text-gray-500 mt-1 italic">{award.criteria}</p>
                                            )}
                                            {earnedDate && (
                                                <p className="text-xs text-green-400/70 mt-1">Earned on {earnedDate}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {filteredAwards.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                    No awards found matching your filter.
                </div>
            )}
        </div>
    );
}
