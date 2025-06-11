module.exports = {
    command: 'الوقت',
    description: 'يعرض الوقت والتاريخ الحالي',
    category: 'أدوات',

    async execute(sock, msg) {
        const now = new Date();
        const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('ar-EG');
        const day = now.toLocaleDateString('ar-EG', { weekday: 'long' });

        await sock.sendMessage(msg.key.remoteJid, {
            text: `🕒 تاريخ اليوم:\n📅 ${day}، ${date}\n⏰ الوقت هلق: ${time}`
        }, { quoted: msg });
    }
};