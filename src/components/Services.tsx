'use client';

import { useState } from 'react';

const services = [
    {
        id: 'flight-tracking',
        title: 'Flight Tracking',
        description: 'Real-time tracking of all flights with detailed route visualization and live updates.',
        icon: <i className="fas fa-4x fa-laptop-code text-primary mb-4"></i>,
    },
    {
        id: 'pilot-career',
        title: 'Pilot Career',
        description: 'Progress through ranks, earn credits, and advance your virtual aviation career.',
        icon: <i className="fas fa-4x fa-road text-primary mb-4"></i>,
    },
    {
        id: 'world-explorer',
        title: 'World Explorer',
        description: 'Discover airports and routes around the world with our comprehensive route network.',
        icon: <i className="fas fa-4x fa-plane text-primary mb-4"></i>,
    },
];

export default function Services() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="py-24 px-4 bg-dark-800/50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        At Your Service
                    </h2>
                    <div className="divider" />
                </div>

                {/* Carousel */}
                <div className="relative">
                    {/* Cards */}
                    <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className={`flex-shrink-0 w-80 md:w-auto snap-center glass-card p-8 cursor-pointer transition-all duration-300 ${activeIndex === index
                                    ? 'ring-2 ring-accent-gold shadow-lg scale-105'
                                    : 'hover:ring-1 hover:ring-white/20'
                                    }`}
                                onClick={() => setActiveIndex(index)}
                            >
                                <div className="text-accent-gold mb-6">{service.icon}</div>
                                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                                <p className="text-gray-400">{service.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Carousel Indicators */}
                    <div className="flex justify-center gap-2 mt-8 md:hidden">
                        {services.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${activeIndex === index
                                    ? 'bg-accent-gold w-6'
                                    : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
