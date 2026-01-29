import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Background Gradient */}
            {/* Background Image */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay for readability */}
                <img
                    src="/img/hero-img.png"
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                {/* Logo Icon */}
                <div className="mb-8 animate-float">
                    <div className="w-[250px] h-[250px] mx-auto relative">
                        <img src="/img/logo.png" alt="Levant Virtual Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
                    </div>
                </div>

                {/* Title */}
                {/* Title */}
                <h1 className="text-[54px] font-display font-bold text-white mb-4 tracking-tight">
                    Levant Virtual Airline
                </h1>

                {/* Tagline */}
                {/* Tagline */}
                <p className="text-[44px] text-gradient font-semibold mb-8">
                    The Inspiration of Middle East
                </p>

                {/* Description */}
                <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12">
                    Experience the skies of the Middle East with our advanced flight operations
                    software and supportive community of aviation enthusiasts.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="#about" className="btn-primary inline-block">
                        Explore Now!
                    </Link>
                    <Link href="/login" className="btn-secondary inline-block">
                        Pilot Portal
                    </Link>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </div>
        </section>
    );
}
