'use client';

import { useState } from 'react';
import Link from 'next/link';

// Registration Page - Key System Removed

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        ivaoId: '',
        desiredCallsign: '',
        country: '',
        city: '',
        timezone: '',
        phoneNumber: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Country/Timezone Data State
    const [countriesData, setCountriesData] = useState<any[]>([]);
    const [availableTimezones, setAvailableTimezones] = useState<string[]>([]);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // Fetch Countries on Mount
    useState(() => {
        if (typeof window !== 'undefined') {
            setLoadingCountries(true);
            fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,timezones')
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        // Sort countries alphabetically
                        const sorted = data.sort((a: any, b: any) =>
                            a.name.common.localeCompare(b.name.common)
                        );
                        setCountriesData(sorted);
                    }
                })
                .catch((err) => console.error('Failed to fetch countries:', err))
                .finally(() => setLoadingCountries(false));
        }
    });

    const fetchCities = async (countryName: string) => {
        setLoadingCities(true);
        setAvailableCities([]);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryName }),
            });
            const data = await response.json();
            if (!data.error && Array.isArray(data.data)) {
                setAvailableCities(data.data);
            } else {
                setAvailableCities([]);
            }
        } catch (err) {
            console.error('Failed to fetch cities:', err);
        } finally {
            setLoadingCities(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'phoneNumber') {
            // Enforce format: +[digits/spaces]
            // If user deletes everything, allow it to be empty to let them restart typing
            if (value === '') {
                 setFormData({ ...formData, phoneNumber: '' });
                 return;
            }
            
            // If it doesn't start with +, add it (unless they are deleting)
            let formattedValue = value;
            if (!value.startsWith('+')) {
                formattedValue = '+' + value.replace(/[^\d\s]/g, '');
            } else {
                // Allow + only at start, then digits and spaces
                formattedValue = '+' + value.substring(1).replace(/[^\d\s]/g, '');
            }

            setFormData({
                ...formData,
                phoneNumber: formattedValue,
            });
        } else if (name === 'country') {
            // Update timezones when country changes
            const countryObj = countriesData.find((c) => c.name.common === value);
            setAvailableTimezones(countryObj ? countryObj.timezones : []);

            // Update cities
            fetchCities(value);

            setFormData({
                ...formData,
                country: value,
                timezone: '', // Reset timezone
                city: '', // Reset city
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleRegistrationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, quizPassed: true }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    // Cooldown trigger from server
                }
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // Check for existing cooldown (Logic disabled but structure kept)
    useState(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('registrationCooldown');
        }
    });

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="glass-card p-8 max-w-md text-center">
                    <div className="text-green-400 text-6xl mb-6">✓</div>
                    <h1 className="text-2xl font-bold text-white mb-4">Registration Successful!</h1>
                    <p className="text-gray-400 mb-6">
                        Welcome to Levant Virtual Airline! You can now log in to your pilot portal.
                    </p>
                    <Link href="/portal/dashboard" className="btn-primary inline-block">
                        Go to Pilot Portal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6 px-4 flex flex-col justify-center">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-primary-900/10 to-dark-900 -z-10" />

            <div className="w-full md:w-[700px] xl:w-[750px] mx-auto">
                {/* Header */}
                <div className="text-center mb-4">
                    <Link href="/" className="inline-block mb-4">
                        <div className="w-15 h-17 mx-auto relative">
                            <img src="/img/logo.png" alt="Levant Virtual" className="w-full h-full object-contain" />
                        </div>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                        Pilot Registration
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Complete your profile to finish registration
                    </p>
                </div>

                <div className="glass-card p-8 relative overflow-hidden transition-all duration-500">
                    {/* Progress Bar (Removed) */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-dark-700">
                        <div
                            className="h-full bg-accent-gold transition-all duration-500"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 mt-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegistrationSubmit} className="mt-4">
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                Personal Information
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. +961 70 123 456"
                                        pattern="^\+[0-9]{1,3}[0-9\s]{6,}$"
                                        title="Please enter a valid phone number with country code (e.g. +1 555 123 4567)"
                                        className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Desired Callsign</label>
                                    <input
                                        type="text"
                                        name="desiredCallsign"
                                        value={formData.desiredCallsign}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. LVT123"
                                        className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">IVAO ID (Optional)</label>
                                    <input
                                        type="text"
                                        name="ivaoId"
                                        value={formData.ivaoId}
                                        onChange={handleInputChange}
                                        className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength={8}
                                        className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                    />
                                </div>
                                <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Country</label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loadingCountries}
                                            className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                        >
                                            <option value="">{loadingCountries ? 'Loading...' : 'Select your country'}</option>
                                            {countriesData.map((c) => (
                                                <option key={c.name.common} value={c.name.common}>
                                                    {c.name.common}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Timezone</label>
                                        <select
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.country}
                                            className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                        >
                                            <option value="">Select Timezone</option>
                                            {availableTimezones.map((tz) => (
                                                <option key={tz} value={tz}>
                                                    {tz}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-400 text-sm mb-2">City</label>
                                        {availableCities.length > 0 ? (
                                            <select
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loadingCities || !formData.country}
                                                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                            >
                                                <option value="">{loadingCities ? 'Loading Cities...' : 'Select City'}</option>
                                                {availableCities.map((city) => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                placeholder={loadingCities ? "Loading cities..." : "Enter city name"}
                                                disabled={loadingCities}
                                                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Complete Registration'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-accent-gold hover:underline">
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
