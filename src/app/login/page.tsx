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
            <div className="text-center mb-8">
                <Link href="/" className="inline-block mb-4">
                    <div className="w-25 h-24 mx-auto relative">
                        <img src="/img/logo.png" alt="Levant Virtual" className="w-full h-full object-contain" />
                    </div>
                </Link>
                <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-gray-400 text-sm">Sign in to your pilot portal</p>
            </div>

            {/* Login Card */}
            <div className="glass-card p-8 w-full max-w-md">
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                            placeholder="pilot@levant-va.com"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-gray-400 text-sm">Password</label>
                            <Link href="/forgot-password" className="text-xs text-accent-gold hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <p className="text-gray-500 text-sm">
                        Don't have an account yet?{' '}
                        <Link href="/register" className="text-white hover:text-accent-gold transition-colors font-medium">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
