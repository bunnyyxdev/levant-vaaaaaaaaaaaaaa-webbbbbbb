'use client';

import { useState, useEffect } from 'react';
import { Settings, Lock, Eye, EyeOff, Check, AlertCircle, Plane } from 'lucide-react';

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // SimBrief ID
    const [simbriefId, setSimbriefId] = useState('');
    const [simbriefLoading, setSimbriefLoading] = useState(false);
    const [simbriefMessage, setSimbriefMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Load current SimBrief ID
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user?.simbriefId) {
                    setSimbriefId(data.user.simbriefId);
                }
            })
            .catch(console.error);
    }, []);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to change password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSimbriefSave = async () => {
        setSimbriefMessage(null);
        
        if (!simbriefId.trim()) {
            setSimbriefMessage({ type: 'error', text: 'Please enter your SimBrief Pilot ID' });
            return;
        }
        
        setSimbriefLoading(true);
        try {
            const res = await fetch('/api/settings/simbrief', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ simbriefId }),
            });

            if (res.ok) {
                setSimbriefMessage({ type: 'success', text: 'SimBrief ID saved!' });
            } else {
                const data = await res.json();
                setSimbriefMessage({ type: 'error', text: data.error || 'Failed to save' });
            }
        } catch (error) {
            setSimbriefMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSimbriefLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-8 h-8 text-accent-gold" />
                <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>

            {/* SimBrief ID Section */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Plane className="w-5 h-5 text-accent-gold" />
                    <h2 className="text-lg font-semibold text-white">SimBrief Integration</h2>
                </div>

                {simbriefMessage && (
                    <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
                        simbriefMessage.type === 'success' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                        {simbriefMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {simbriefMessage.text}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">SimBrief Pilot ID</label>
                        <input
                            type="text"
                            value={simbriefId}
                            onChange={e => setSimbriefId(e.target.value)}
                            className="w-full bg-dark-700 border border-white/10 rounded px-4 py-3 text-white"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Find your Pilot ID at simbrief.com → Account Settings → Pilot ID
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSimbriefSave}
                        disabled={simbriefLoading}
                        className="bg-accent-gold text-dark-900 px-6 py-2 rounded-lg font-semibold hover:bg-accent-gold/80 transition-colors disabled:opacity-50"
                    >
                        {simbriefLoading ? 'Saving...' : 'Save SimBrief ID'}
                    </button>
                </div>
            </div>

            {/* Password Change Section */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-5 h-5 text-accent-gold" />
                    <h2 className="text-lg font-semibold text-white">Change Password</h2>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        message.type === 'success' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                        {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                        <div className="relative">
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                                className="w-full bg-dark-700 border border-white/10 rounded px-4 py-3 text-white pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full bg-dark-700 border border-white/10 rounded px-4 py-3 text-white pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-dark-700 border border-white/10 rounded px-4 py-3 text-white pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent-gold text-dark-900 py-3 rounded-lg font-semibold hover:bg-accent-gold/80 transition-colors disabled:opacity-50 mt-6"
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
