'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Redirect to pilot portal logic will be handled by client or middleware check
            router.push('/portal/dashboard');
            router.refresh();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-6 px-4 flex flex-col justify-center items-center">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-primary-900/10 to-dark-900 -z-10" />

            {/* Header */}
            <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <Link href="/" className="inline-block mb-4">
                    <div className="w-25 h-24 mx-auto relative group">
                        <img src="/img/logo.png" alt="Levant Virtual" className="w-full h-full object-contain filter group-hover:brightness-110 transition-all" />
                    </div>
                </Link>
                <h1 className="text-4xl font-display font-medium text-white mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-white/60 text-sm font-medium">Sign in to your pilot portal</p>
            </div>

            {/* Login Card */}
            <div className="bg-white/90 backdrop-blur-2xl p-10 w-full max-w-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 animate-in zoom-in-95 duration-500">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-black/5 border border-black/5 rounded-2xl px-5 py-4 text-black text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                            placeholder="pilot@levant-va.com"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Password</label>
                            <Link href="/forgot-password" className="text-[10px] uppercase font-bold tracking-widest text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                                Reset?
                            </Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-black/5 border border-black/5 rounded-2xl px-5 py-4 text-black text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Sign In To Portal'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-black/5 text-center">
                    <p className="text-gray-400 text-xs font-medium">
                        Need an account?{' '}
                        <Link href="/register" className="text-black hover:text-primary-600 transition-colors font-bold">
                            Create Identity
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
