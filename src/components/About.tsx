import Link from 'next/link';

export default function About() {
    return (
        <section id="about" className="py-24 px-4 relative">
            {/* Background Accent */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/5 to-transparent" />

            <div className="max-w-4xl mx-auto text-center relative z-10">

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                    The Leading Virtual Airline of Middle East
                </h2>

                {/* Divider */}
                <div className="divider" />

                {/* Description */}
                <p className="text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
                    With a special focus on historical operations together with up-to-date modern flights,
                    Levant Virtual brings you to newer skies with our advanced flight operations software
                    and a supportive community!
                </p>

                {/* CTA Button */}
                <Link href="/register" className="btn-primary inline-block">
                    Register Now!
                </Link>
            </div>
        </section>
    );
}
