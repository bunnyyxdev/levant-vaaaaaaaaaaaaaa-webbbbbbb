'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, ExternalLink, Shield, ShoppingBag, Radio, Monitor, Archive, BookOpen, X, ChevronRight, Gauge, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AcarsFile {
    type: 'exe' | 'zip';
    version: string;
    filePath: string;
    size: string;
    notes?: string;
    uploadedAt: string;
}

export default function DownloadsPage() {
    const [showAcarsModal, setShowAcarsModal] = useState(false);
    const [acarsFiles, setAcarsFiles] = useState<AcarsFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await fetch('/api/acars/latest');
                if (res.ok) {
                    const data = await res.json();
                    setAcarsFiles(data.files);
                }
            } catch (err) {
                console.error('Failed to fetch ACARS info:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLatest();
    }, []);

    const exeFile = acarsFiles.find(f => f.type === 'exe');
    const zipFile = acarsFiles.find(f => f.type === 'zip');

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Download className="w-8 h-8 text-accent-gold" />
                    Downloads
                </h1>
                <p className="text-gray-400 mt-2">Essential tools for your career</p>
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
                        
                        {loading ? (
                            <div className="flex items-center gap-2 text-gray-500 font-mono text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading version info...
                            </div>
                        ) : exeFile ? (
                            <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                                <span>v{exeFile.version}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                <span>Updated: {new Date(exeFile.uploadedAt).toLocaleDateString()}</span>
                            </div>
                        ) : (
                            <div className="text-sm text-yellow-500/60 font-mono">No version uploaded yet</div>
                        )}

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

            {/* Security Note */}
            <div className="glass-card p-6 flex items-start gap-4 mt-8">
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
                            {acarsFiles.length === 0 && !loading && (
                                <div className="text-center py-8 text-gray-500 italic">
                                    No files available for download yet.
                                </div>
                            )}
                            {acarsFiles.map((ver) => (
                                <a 
                                    key={ver.type}
                                    href={ver.filePath}
                                    download
                                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-accent-gold/30 transition-all group"
                                >
                                    <div className="p-3 bg-dark-900 rounded-lg group-hover:scale-110 transition-transform">
                                        {ver.type === 'exe' ? <Monitor className="w-6 h-6 text-blue-400" /> : <Radio className="w-6 h-6 text-green-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-white">
                                                {ver.type === 'exe' ? 'Windows Installer' : 'X-Plane Plugin'}
                                            </h4>
                                            <span className="text-xs text-gray-500 font-mono">{ver.size}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">Version {ver.version}</p>
                                        {ver.notes && (
                                            <div className="mt-2 text-xs text-gray-500 line-clamp-2 italic border-l border-white/10 pl-3">
                                                "{ver.notes}"
                                            </div>
                                        )}
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
