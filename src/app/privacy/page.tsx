'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-dark-900">
            {/* Simple Header */}
            <header className="bg-dark-800 border-b border-white/10 py-4">
                <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-white">
                        Levant Virtual Airlines
                    </Link>
                    <Link href="/login" className="text-accent-gold hover:text-white text-sm transition-colors">
                        Login
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <Shield className="w-10 h-10 text-accent-gold" />
                        Privacy Policy
                    </h1>
                    <p className="text-gray-400">Levant Virtual Airlines</p>
                </div>

                {/* Content */}
                <div className="glass-card p-8 space-y-6">
                    <div>
                        <p className="text-white font-bold mb-4">Welcome to Levant VA.</p>
                        
                        <h2 className="text-lg font-semibold text-accent-gold mb-2">Introduction</h2>
                        <p className="text-gray-300 leading-relaxed">
                            At Levant Virtual Airlines (Levant VA), we take your privacy seriously. 
                            This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
                        </p>
                        <p className="text-gray-300 leading-relaxed mt-2">
                            We are committed to adhering to the General Data Protection Regulation (GDPR) and other applicable laws. 
                            By using our services, you agree to the practices outlined in this policy.
                        </p>
                        <p className="text-gray-300 leading-relaxed mt-2">
                            If you have any questions or concerns about your data or this policy, please contact us at any time.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-accent-gold mb-3">1. Information We Collect</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li><strong className="text-white">Personal Identification Details:</strong> This includes your name, email address, and IVAO Virtual ID (VID).</li>
                            <li><strong className="text-white">Service Usage Data:</strong> We track your participation in virtual airline services, such as flight statistics, completed routes, and overall engagement with Levant VA.</li>
                            <li><strong className="text-white">Communication Records:</strong> Any interactions between you and Levant VA, including emails, inquiries, and support requests, are recorded to help us provide better service.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-accent-gold mb-3">2. Purpose of Data Collection</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li><strong className="text-white">Manage Your Membership:</strong> Create and maintain your virtual airline account, making it easier for you to access our services.</li>
                            <li><strong className="text-white">Enhance Our Services:</strong> Analyze flight data and user interactions to continuously improve our offerings and operations.</li>
                            <li><strong className="text-white">Provide Customer Support:</strong> Respond to your questions, feedback, or concerns promptly and effectively.</li>
                            <li><strong className="text-white">Keep You Informed:</strong> Share important updates, news, and changes to our services as needed.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-accent-gold mb-3">3. Your Rights Under GDPR</h2>
                        <p className="text-gray-300 mb-3">
                            We are committed to upholding GDPR standards and prioritize your rights as a user. Under GDPR, you have the following rights:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li><strong className="text-white">Access Your Data:</strong> You may request to see the personal data we hold about you.</li>
                            <li><strong className="text-white">Correct Inaccuracies:</strong> If any of your information is outdated or incorrect, you can request an update.</li>
                            <li><strong className="text-white">Delete Your Data:</strong> You have the right to request the deletion of your personal information.</li>
                            <li><strong className="text-white">Restrict Data Usage:</strong> In certain situations, you can request limitations on how we utilize your data.</li>
                            <li><strong className="text-white">Withdraw Consent:</strong> You may withdraw your consent for us to process your personal data at any time.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-accent-gold mb-3">4. Data Protection and Security</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We are dedicated to ensuring that your personal data remains safe and secure. 
                            Our security measures include encryption, access controls, and regular monitoring to protect against unauthorized access, alteration, or disclosure of your data.
                        </p>
                        <p className="text-gray-300 leading-relaxed mt-2">
                            We will not sell, trade, or share your personal information with third parties unless required by law or necessary to provide the services you signed up for, such as IVAO-related functionalities.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-accent-gold mb-3">5. User-Generated Content</h2>
                        <p className="text-gray-300 leading-relaxed">
                            When you contribute content on the Levant VA platform (such as comments, flight logs, or media), you must ensure that you have the rights to do so and that your content does not violate any legal rights of others, including intellectual property and privacy rights.
                        </p>
                        <p className="text-gray-300 leading-relaxed mt-2">
                            Levant VA reserves the right to review, edit, or remove user-generated content if it is found to violate any applicable laws or community guidelines, although we are not obligated to do so.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-accent-gold mb-3">6. Policy Updates and Changes</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We may periodically update this Privacy Policy to reflect changes in our services or legal requirements. 
                            Any substantial modifications will be communicated to you directly via email or through prominent notices on our website.
                        </p>
                        <p className="text-gray-300 leading-relaxed mt-2">
                            We encourage you to review this policy from time to time to stay informed about how we are protecting your data and what changes may have occurred. Your continued use of Levant VA's services after changes are made constitutes your acceptance of the updated policy.
                        </p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h2 className="text-lg font-semibold text-accent-gold mb-3">Acknowledgment and Agreement</h2>
                        <p className="text-gray-300 leading-relaxed">
                            By using our website, joining Levant VA, or engaging with our services, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
                        </p>
                        <p className="text-gray-300 leading-relaxed mt-2">
                            Your use of our services constitutes your consent to the collection and use of your personal data as described in this policy.
                        </p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h2 className="text-lg font-semibold text-accent-gold mb-3">Contact Information</h2>
                        <p className="text-gray-300">
                            For any questions, clarifications, or concerns regarding your data or this policy, please do not hesitate to reach out to us.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-gray-500 text-sm pt-4">
                    <Link href="/" className="hover:text-accent-gold transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
