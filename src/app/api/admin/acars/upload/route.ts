import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import AcarsFile from '@/models/AcarsFile';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

import { jwtSecret, blobToken, discordWebhooks } from '@/config/config';

import { put } from '@vercel/blob';

async function isAdmin(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('lva_session')?.value;
    if (!token) return false;

    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        return payload.isAdmin === true;
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { url, version, type, notes, fileName, size } = await request.json();

        if (!url || !version || !type || !fileName || !size) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Check if a file of this type and version already exists
        const existing = await AcarsFile.findOne({ type, version });
        if (existing) {
            existing.fileName = fileName;
            existing.filePath = url;
            existing.size = size;
            existing.notes = notes;
            existing.uploadedAt = new Date();
            await existing.save();
        } else {
            await AcarsFile.create({
                type,
                version,
                fileName,
                filePath: url,
                size,
                notes: notes
            });
        }

        // Send Discord Announcement
        try {
            const webhookUrl = discordWebhooks.acarsRelease;
            const downloadUrl = 'https://test.levant-va.com/portal/downloads';
            
            const embed = {
                title: `✨ New Update Available: ACARS v${version}`,
                description: `**A new version of the Levant ACARS Tracker is live!**\n\nUpgrade now to access the latest features, fixes, and performance improvements for the best flight experience.`,
                color: 0xD4AF37, // Gold
                thumbnail: {
                    url: 'https://test.levant-va.com/img/logo.png' 
                },
                fields: [
                    { name: '📦 Version', value: `\`v${version}\``, inline: true },
                    { name: '🔧 Type', value: `\`${type.toUpperCase()}\``, inline: true },
                    { name: '💾 Size', value: `\`${size}\``, inline: true }
                ] as any[],
                image: {
                    url: 'https://test.levant-va.com/img/hero-img.png' // Optional: Generic nice banner
                },
                timestamp: new Date().toISOString(),
                footer: { text: 'Levant Virtual Airline | Engineering Team', icon_url: 'https://test.levant-va.com/img/logo.png' }
            };

            if (notes) {
                embed.fields.push({ name: '📝 What\'s New', value: `>>> ${notes}`, inline: false });
            }

            embed.fields.push({ 
                name: '⬇️ Download Now', 
                value: `[**Click here to Download via Portal**](${downloadUrl})`, 
                inline: false 
            });

            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'Levant System',
                    avatar_url: 'https://test.levant-va.com/img/logo.png',
                    embeds: [embed]
                })
            });
        } catch (discordErr) {
            console.error('Discord announcement failed:', discordErr);
        }

        return NextResponse.json({ message: 'Release entry created and announced successfully', path: url });
    } catch (error: any) {
        console.error('Save metadata error:', error);
        return NextResponse.json({ error: error.message || 'Saving metadata failed' }, { status: 500 });
    }
}
