export default function TrackerPage() {
    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <h1 className="text-2xl font-bold text-white mb-2">Levant Tracker</h1>
                <p className="text-gray-400">Download our ACARS client to track your flights</p>
            </div>

            <div className="glass-card p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent-gold to-accent-bronze rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">📡</span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-4">Levant Tracker v1.0</h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                    Our custom ACARS system automatically tracks your flights and submits PIREPs.
                    Compatible with MSFS 2020, X-Plane 12, and P3D.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="btn-primary">Download for Windows</button>
                    <button className="btn-secondary">Download for Mac</button>
                </div>
                <p className="text-gray-500 text-sm mt-4">Version 1.0.0 • Released Jan 2024</p>
            </div>

            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">System Requirements</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-accent-gold font-medium mb-2">Windows</h3>
                        <ul className="text-gray-400 text-sm space-y-1">
                            <li>• Windows 10 or later</li>
                            <li>• .NET Framework 4.8</li>
                            <li>• 50 MB disk space</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-accent-gold font-medium mb-2">macOS</h3>
                        <ul className="text-gray-400 text-sm space-y-1">
                            <li>• macOS 11 Big Sur or later</li>
                            <li>• 50 MB disk space</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
