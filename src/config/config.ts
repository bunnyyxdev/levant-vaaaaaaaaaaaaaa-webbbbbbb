// JWT Secret for authentication
export const jwtSecret = '3876963d1d10dae6d6abc075fdc22046353ee8165ec095fc17a7c8fd25026336';

// MongoDB Configuration
export const mongoConfig = {
    uri: 'mongodb+srv://sugarbunnystores_db_user:Ryyoq9WDILhd4rvn@cluster0.3tivyqi.mongodb.net/levant_virtual?retryWrites=true&w=majority',
    options: {
        // Mongoose 6+ no longer needs these, but keeping for reference
    }
};

export const QUIZ_COOLDOWN_MS = 0; // Cooldown disabled

// SMTP Email Configuration
export const smtpConfig = {
    host: 'mail.levant-va.com', // Use ssl:// prefix handled by secure:true for port 465
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
        user: 'noreply@levant-va.com',
        pass: 'rUEUrGkngtp7WDeGSEbV',
    },
    from: '"Levant Virtual" <noreply@levant-va.com>',
};

// Social Media Links Configuration
// Set to empty string to hide icon
export const socialMediaConfig = {
    facebook: "https://www.facebook.com/levant.vas/",
    youtube: "https://www.youtube.com/@levantva",
    discord: "https://discord.levant-va.com/",
    instagram: "https://www.instagram.com/levantva/",
};

// PIREP Configuration
export const autoPirepMinScore = 80; // Minimum score for automatic approval
export const autoPirepRejectLandingRate = -500; // Landing rate worse than this = Auto-Reject

// Advanced Scoring Parameters
export const scoringConfig = {
    taxiOverspeed: 30, // GS knots
    stallPenalty: 20,
    overspeedPenalty: 10,
    lightsPenalty: 5,
    taxiOverspeedPenalty: 5,
    hardLandingThreshold: -300,
    veryHardLandingThreshold: -500,
    structuralDamageThreshold: -800,
    slewDetectionPenalty: 50,
};

// Personnel Management
export const inactivityLoaDays = 30; // Days until On leave (LOA)
export const inactivityInactiveDays = 60; // Days until Inactive

// Discord Webhooks
export const discordWebhooks = {
    takeoff: 'https://discord.com/api/webhooks/1466214163742326981/IGGoTrqGncm-lH4GM-RjZbL1zEh9JFh0aVPxmqVINkMDs10liyeTYrsuNipbKZvFJbrm',
    landing: 'https://discord.com/api/webhooks/1466214163742326981/IGGoTrqGncm-lH4GM-RjZbL1zEh9JFh0aVPxmqVINkMDs10liyeTYrsuNipbKZvFJbrm',
    rankPromote: 'https://discord.com/api/webhooks/1466214165948665858/jqCkfC6-3Ane8TLw-hq7nNJnZnjrrTjsPLvVn0Dl08mZMr8IiXCq9-tqXzKkWxdABI2e',
    errorLog: 'https://discord.com/api/webhooks/1331665427138379897/T-Ie9F-6e_6hE-Uv8M-Uj8uY_5-6U-9u6E_6hE-Uv8M-Uj8uY_5-6U-9u'
};
