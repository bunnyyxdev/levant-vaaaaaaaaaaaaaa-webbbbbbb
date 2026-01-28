// JWT Secret for authentication
export const jwtSecret = 'jwt_for_levant_virtual'; // Change this to a secure random string

// MongoDB Configuration
export const mongoConfig = {
    uri: process.env.MONGODB_URI || 'mongodb+srv://sugarbunnystores_db_user:Ryyoq9WDILhd4rvn@cluster0.3tivyqi.mongodb.net/levant_virtual?retryWrites=true&w=majority',
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
