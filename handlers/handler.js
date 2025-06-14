const { extractPureNumber } = require('../haykala/elite');
const commands = {
    نخبة: require('../plugins/addelite'),
    // أضف هنا باقي أوامرك
};

async function handleMessages(sock, msg) {
    try {
        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const senderNumber = extractPureNumber(senderJid);

        const messageText =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            '';

        if (!messageText.startsWith('.')) return;

        const parts = messageText.trim().split(/\s+/);
        const commandName = parts[0].slice(1); // حذف النقطة

        const command = commands[commandName];
        if (!command) return;

        await command.execute(sock, msg);

    } catch (err) {
        console.error('✗ Error handling message:', err);
    }
}

module.exports = {
    handleMessages,
};
