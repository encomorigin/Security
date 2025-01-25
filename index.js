const { Client, Intents } = require('discord.js');
const config = {
    "BOT_PREFIX": "!",
    "GUILD_ID": "your-guild-id", // Replace with your server's guild ID
    "LOG_CHANNEL_ID": "log-channel-id", // Replace with your log channel's ID
    "ALLOWED_ROLES": [
        "FounderRoleID",    // Replace with the role ID for the Founder role
        "MaintainerRoleID", // Replace with the role ID for the Maintainer role
        "TeamRoleID",       // Replace with the role ID for the Team role
        "ModeratorRoleID"   // Replace with the role ID for the Moderator role
    ]
};

const bannedWords = ['badword1', 'badword2', 'badword3']; // List of bad words
const riskyUrls = ['malicious-link1.com', 'malicious-link2.com']; // List of harmful URLs

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Set bot status to "Watching Encom" and idle mode
    client.user.setPresence({
        activities: [
            { name: 'Encom', type: 'WATCHING' }
        ],
        status: 'idle'  // This sets the status to idle
    });
});

client.on('messageCreate', async (message) => {
    // Skip if the message is from a bot
    if (message.author.bot) return;

    // Check if the member has one of the allowed roles
    const member = message.guild.members.cache.get(message.author.id);
    const hasAllowedRole = member.roles.cache.some(role => config.ALLOWED_ROLES.includes(role.id));

    if (!hasAllowedRole) {
        // If the user does not have an allowed role, delete the message and notify them
        await message.delete();
        await message.author.send("You do not have permission to use the bot in this server.");
        return;
    }

    // Check for risky words or phrases (Warn user, delete message)
    for (let word of bannedWords) {
        if (message.content.toLowerCase().includes(word.toLowerCase())) {
            await message.delete();
            await message.author.send("Warning: Your message contained inappropriate language and has been deleted.");
            return;
        }
    }

    // Check for risky URLs (HTTP links) - Timeout user for 12 hours
    if (message.content.includes('http://')) {
        await message.member.timeout(12 * 60 * 60 * 1000, 'Sent HTTP link');
        return;
    }

    // Check for nudity (placeholder for content moderation API) - Timeout user for 12 hours
    if (message.content.toLowerCase().includes('nudity')) {
        await message.member.timeout(12 * 60 * 60 * 1000, 'Sent nudity-related content');
        return;
    }

    // Check for PDFs (file check) - Timeout user for 3 hours
    if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        if (attachment.name.endsWith('.pdf')) {
            await message.member.timeout(3 * 60 * 60 * 1000, 'Sent a PDF file');
            return;
        }
    }

    // Check for malware or server raids (using external APIs) - Ban user for harmful content
    for (let url of riskyUrls) {
        if (message.content.includes(url)) {
            await message.member.ban({ reason: 'Sent harmful content (malware or raid links)' });
            return;
        }
    }
});

client.login(process.env.BOT_TOKEN);
