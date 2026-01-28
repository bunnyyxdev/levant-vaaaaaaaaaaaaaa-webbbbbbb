export default function Partners() {
    const partners = [
        { name: 'IVAO', logo: '/img/ivao.png', width: 140, link: 'https://www.ivao.aero' },
        { name: 'IVAO Partner VA', logo: '/img/ivao-partner-va.png', width: 140, link: 'https://www.ivao.aero' },
        { name: 'VATSIM', logo: '/img/vatsim.png', width: 140, link: 'https://www.vatsim.net' },
    ];

    return (
        <section id="partners" className="py-20 bg-dark-900 border-t border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        Our Partners
                    </h2>
                    <div className="divider" />
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Collaborating with the best networks to provide a realistic aviation experience.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-16 w-full px-4">
                    {partners.map((partner) => (
                        <div key={partner.name} className="flex items-center justify-center">
                            <a href={partner.link} target="_blank" rel="noopener noreferrer" className="block hover:scale-110 transition-transform duration-300">
                                <img
                                    src={partner.logo}
                                    alt={`${partner.name} Logo`}
                                    className="h-20 md:h-24 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
                                />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
