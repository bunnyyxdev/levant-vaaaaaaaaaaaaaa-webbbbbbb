'use client';

import { useState } from 'react';
import { Download, FileText, ExternalLink, Shield, ShoppingBag, Radio, Monitor, Archive, BookOpen, X, ChevronRight, Gauge } from 'lucide-react';
import Link from 'next/link';

export default function DownloadsPage() {
    const [showAcarsModal, setShowAcarsModal] = useState(false);

    const resources = [
        {
            title: 'Pilot Handbook',
            version: '2024 Edition',
            description: 'Essential rules, SOPs, and guidelines for flying with Levant Virtual Airline.',
            icon: <FileText className="w-8 h-8 text-accent-gold" />,
            status: 'Recommended',
            link: '/portal/handbook',
            category: 'Documentation'
        },
        {
            title: 'Levant Pilot Pack',
            version: 'v1.2',
            description: 'Complete collection of checklists, fleet data, and SOPs in one downloadable archive.',
            icon: <Archive className="w-8 h-8 text-blue-400" />,
            status: 'Essential',
            link: '#',
            category: 'Data'
        },
    ];

    const acarsVersions = [
        {
            name: 'Windows Installer',
            type: 'exe',
            size: '85 MB',
            desc: 'Recommended for most users. Includes auto-updater.',
            icon: <Monitor className="w-5 h-5 text-blue-400" />,
            url: '#'
        },
        {
            name: 'Windows Portable',
            type: 'zip',
            size: '82 MB',
            desc: 'Standalone executable. No installation required.',
            icon: <Archive className="w-5 h-5 text-yellow-400" />,
            url: '#'
        },
        {
            name: 'User Manual',
            type: 'pdf',
            size: '2.5 MB',
            desc: 'Comprehensive guide to installing and using the tracker.',
            icon: <BookOpen className="w-5 h-5 text-gray-400" />,
            url: '#'
        },
    ];

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Download className="w-8 h-8 text-accent-gold" />
                    Downloads & Resources
                </h1>
                <p className="text-gray-400 mt-2">Essential tools and documentation for your career</p>
            </div>

            {/* ACARS Hero Section */}
            <div className="glass-card p-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-50" />
                <div className="p-8 md:p-10 relative z-10 grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Gauge className="w-6 h-6 text-blue-400" />
                             </div>
                             <span className="text-blue-400 font-bold tracking-wider text-sm">OFFICIAL SOFTWARE</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Levant ACARS Tracker</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                            <span>v1.4.2</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full" />
                            <span>Updated: Jan 24, 2026</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed max-w-xl">
                            Our custom-built flight tracking software is the heart of your operations. 
                            It automatically records your flight data, monitors your landing rate, and submits PIREPs directly to our system.
                            Required for all official Levant VA flights.
                        </p>
                        
                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                onClick={() => setShowAcarsModal(true)}
                                className="bg-accent-gold hover:bg-accent-gold/80 text-dark-900 px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 transform hover:scale-105"
                            >
                                <Download className="w-5 h-5" />
                                Download ACARS
                            </button>
                            <a href="#" className="px-6 py-3 rounded-lg font-medium text-white hover:bg-white/5 transition-all flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Update Notes
                            </a>
                        </div>
                    </div>
                    {/* Placeholder for ACARS UI Preview Image */}
                    <div className="hidden md:flex justify-center items-center h-full min-h-[200px] bg-dark-800/50 rounded-xl border border-white/5 relative">
                         <div className="text-center p-6">
                            <Gauge className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm">ACARS Interface Preview</p>
                         </div>
                         {/* Decorative Elements */}
                         <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-gold/5 rounded-full blur-2xl" />
                         <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>

            {/* Other Resources Grid */}
            <h2 className="text-xl font-bold text-white pt-4">Additional Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((item) => (
                    <div key={item.title} className="glass-card p-6 flex flex-col justify-between border border-white/5 hover:border-accent-gold/20 transition-all group">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-dark-700 rounded-xl group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                    item.status === 'Required' ? 'bg-red-500/10 text-red-500' : 
                                    item.status === 'Recommended' ? 'bg-blue-500/10 text-blue-500' : 'bg-white/10 text-gray-400'
                                }`}>
                                    {item.status}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                    <span className="text-xs text-gray-500 font-mono">{item.version}</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-2">{item.description}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <Link 
                                href={item.link}
                                className="w-full bg-dark-700 hover:bg-white/10 text-white py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-all text-accent-gold" />
                                {item.category === 'Documentation' ? 'Read Online' : 'Download Now'}
                            </Link>
                        </div>
                    </div>
                ))}

                 {/* Fleet Liveries Card */}
                <div className="glass-card p-6 flex flex-col justify-between border border-white/5 hover:border-accent-gold/20 transition-all group bg-gradient-to-br from-accent-gold/5 to-transparent">
                     <div className="space-y-4">
                         <div className="flex justify-between items-start">
                             <div className="p-3 bg-accent-gold/10 rounded-xl group-hover:scale-110 transition-transform">
                                 <ShoppingBag className="w-8 h-8 text-accent-gold" />
                             </div>
                             <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-500">
                                 Store
                             </span>
                         </div>
                         <div>
                            <h3 className="text-lg font-bold text-white">Aircraft Liveries</h3>
                            <p className="text-gray-400 text-sm mt-2">
                                Exclusive 8K liveries for our fleet. Redeem your flight points to unlock these premium downloads.
                            </p>
                        </div>
                     </div>
                     <div className="mt-6 pt-6 border-t border-white/5">
                            <Link 
                                href="/portal/store"
                                className="w-full bg-accent-gold hover:opacity-90 text-dark-900 py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Visit Pilot Store
                            </Link>
                    </div>
                </div>
            </div>

            {/* Security Note */}
            <div className="glass-card p-6 flex items-start gap-4">
                 <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                 <div>
                     <h3 className="text-white font-semibold mb-1">Secure Downloads</h3>
                     <p className="text-sm text-gray-400">
                         All official Levant Virtual Airline software is digitally signed. 
                         Please ensure you only download our tools from this portal to guarantee security and compatibility.
                     </p>
                 </div>
            </div>

            {/* ACARS Download Modal */}
            {showAcarsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-800">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Gauge className="w-5 h-5 text-accent-gold" />
                                    Download ACARS Tracker
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">Select your preferred version</p>
                            </div>
                            <button 
                                onClick={() => setShowAcarsModal(false)}
                                className="text-gray-500 hover:text-white transition-colors p-1"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-3">
                            {acarsVersions.map((ver) => (
                                <a 
                                    key={ver.name}
                                    href={ver.url}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-accent-gold/30 transition-all group"
                                >
                                    <div className="p-3 bg-dark-900 rounded-lg group-hover:scale-110 transition-transform">
                                        {ver.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-white">{ver.name}</h4>
                                            <span className="text-xs text-gray-500 font-mono">{ver.size}</span>
                                        </div>
                                        <p className="text-sm text-gray-400">{ver.desc}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-accent-gold transition-colors" />
                                </a>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-dark-800 border-t border-white/10 text-center text-xs text-gray-500">
                             By downloading, you agree to our <Link href="/privacy" className="text-gray-400 hover:text-white underline">Privacy Policy</Link> and Terms of Use.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
