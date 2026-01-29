import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import SecurityProtector from '@/components/SecurityProtector';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
});

export const metadata: Metadata = {
    title: 'Levant Virtual Airline | The Inspiration of Middle East',
    description: 'Experience the leading virtual airline of the Middle East. Join our advanced flight operations and supportive community.',
    keywords: ['virtual airline', 'flight simulator', 'Middle East', 'aviation', 'IVAO', 'VATSIM'],
    icons: {
        icon: '/img/logo.ico',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth">
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </head>
            <body className="antialiased">
                {/* <SecurityProtector /> */}
                {children}
            </body>
        </html>
    );
}
