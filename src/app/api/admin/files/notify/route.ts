import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { jwtSecret, discordWebhooks } from '@/config/config';

async function isAdmin(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('lva_session')?.value;
    if (!token) return false;

    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        return payload.isAdmin === true || payload.role === 'Admin';
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { fileName, url, size } = await request.json();

        if (!fileName || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Send Discord Announcement
        try {
            const webhookUrl = discordWebhooks.skinUpdate;
            const storeUrl = 'https://test.levant-va.com/portal/store';
            
            const embed = {
                title: `🎨 New ACARS Skin Available!`,
                description: `**A new visual customization package has been uploaded to the Levant Cloud storage.**\n\nEnhance your ACARS experience with this new skin assets package.`,
                color: 0xD4AF37, // Gold
                thumbnail: {
                    url: 'https://test.levant-va.com/img/logo.png' 
                },
                fields: [
                    { name: '📦 Package Name', value: `\`${fileName}\``, inline: false },
                    { name: '💾 Size', value: `\`${size || 'Unknown'}\``, inline: true },
                    { name: '☁️ Provider', value: `\`Vercel Blob / CDN\``, inline: true }
                ],
                image: {
                    url: 'https://test.levant-va.com/img/hero-img.png' 
                },
                timestamp: new Date().toISOString(),
                footer: { text: 'Levant Virtual Airline | Design Team', icon_url: 'https://test.levant-va.com/img/logo.png' }
            };

            embed.fields.push({ 
                name: '🛒 Get it now', 
                value: `[**Visit Pilot Store**](${storeUrl})`, 
                inline: false 
            });

            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'Levant Design',
                    avatar_url: 'https://test.levant-va.com/img/logo.png',
                    embeds: [embed]
                })
            });
        } catch (discordErr) {
            console.error('Discord skin notification failed:', discordErr);
        }

        return NextResponse.json({ success: true, message: 'Notification sent successfully' });
    } catch (error: any) {
        console.error('Skin notification error:', error);
        return NextResponse.json({ error: error.message || 'Notification failed' }, { status: 500 });
    }
}
