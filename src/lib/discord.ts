import { discordWebhooks } from '@/config/config';

type DiscordEvent = 'takeoff' | 'landing' | 'rankPromote' | 'errorLog';

interface DiscordEmbed {
    title?: string;
    description?: string;
    color?: number;
    fields?: { name: string; value: string; inline?: boolean }[];
    thumbnail?: { url: string };
    footer?: { text: string; icon_url?: string };
    timestamp?: string;
    image?: { url: string };
}

export async function sendDiscordNotification(content: string, embeds?: DiscordEmbed[], event: DiscordEvent = 'errorLog') {
    const webhookUrl = (discordWebhooks as any)[event];

    if (!webhookUrl || webhookUrl.includes('YOUR_WEBHOOK_URL')) {
        console.log(`Discord webhook for ${event} not configured or missing.`);
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,
                embeds,
                username: 'Levant Systems',
                avatar_url: 'https://levant-va.com/img/logo.png'
            }),
        });

        if (!response.ok) {
            console.error('Failed to send Discord notification:', await response.text());
        }
    } catch (error) {
        console.error('Error sending Discord notification:', error);
    }
}

export async function notifyRankPromotion(pilotName: string, pilotId: string, rankName: string, rankImageUrl?: string) {
    const embeds: DiscordEmbed[] = [
        {
            title: '🎖️ ACHIEVEMENT UNLOCKED!',
            description: `**${pilotName} | ${pilotId}**, you just unlocked the achievement: **Promoted to ${rankName}!** 🎉`,
            color: 0xD4AF37, // Gold
            thumbnail: {
                url: rankImageUrl || 'https://levant-va.com/img/awards/promotion.png'
            },
            fields: [
                {
                    name: 'New Rank',
                    value: rankName,
                    inline: true
                },
                {
                    name: 'Status',
                    value: 'Active Duty',
                    inline: true
                }
            ],
            footer: {
                text: 'Levant Virtual Airline • Professional Aviation',
                icon_url: 'https://levant-va.com/img/logo.png'
            },
            timestamp: new Date().toISOString()
        }
    ];

    await sendDiscordNotification(`Congratulations <@&ROLE_ID> ${pilotName}!`, embeds, 'rankPromote');
}

export async function notifyTakeoff(pilotName: string, pilotId: string, origin: string, destination: string, aircraft: string, callsign: string) {
    const embeds: DiscordEmbed[] = [
        {
            title: '🛫 Flight Airborne!',
            description: `**${pilotName} | ${pilotId}** has just taken off from **${origin}**!`,
            color: 0x3498DB, // Blue
            fields: [
                { name: 'Callsign', value: callsign, inline: true },
                { name: 'Aircraft', value: aircraft, inline: true },
                { name: 'Route', value: `**${origin}** ➔ **${destination}**`, inline: false }
            ],
            footer: { text: 'Levant Virtual Airline • Live Operations' },
            timestamp: new Date().toISOString()
        }
    ];

    await sendDiscordNotification(`**${callsign}** is now airborne!`, embeds, 'takeoff');
}

export async function notifyLanding(pilotName: string, pilotId: string, destination: string, landingRate: number, score: number, callsign: string) {
    const embeds: DiscordEmbed[] = [
        {
            title: '🛬 Flight Arrived!',
            description: `**${pilotName} | ${pilotId}** has safely landed at **${destination}**!`,
            color: landingRate < -500 ? 0xE74C3C : 0x2ECC71, // Red if hard, Green if good
            fields: [
                { name: 'Callsign', value: callsign, inline: true },
                { name: 'Landing Rate', value: `${landingRate} fpm`, inline: true },
                { name: 'Score', value: `${score}/100`, inline: true }
            ],
            footer: { text: 'Levant Virtual Airline • Professional Aviation' },
            timestamp: new Date().toISOString()
        }
    ];

    await sendDiscordNotification(`**${callsign}** has arrived!`, embeds, 'landing');
}

export async function notifyError(errorTitle: string, errorMessage: string, context?: string) {
    const embeds: DiscordEmbed[] = [
        {
            title: `🚨 SYSTEM ERROR: ${errorTitle}`,
            description: `**Log Entry:** \n\`\`\`\n${errorMessage}\n\`\`\``,
            color: 0xE74C3C, // Red
            fields: context ? [{ name: 'Context', value: context, inline: false }] : [],
            footer: { text: 'Levant Virtual Airline • System Sentinel' },
            timestamp: new Date().toISOString()
        }
    ];

    await sendDiscordNotification('⚠️ **System Error Logged**', embeds, 'errorLog');
}
