module.exports = {
    command: 'تقييم',
    description: 'يعطي تقييم عشوائي لشخص',
    category: 'تفاعل',
    usage: '.تقييم @شخص',

    async execute(sock, msg) {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentioned) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '🔍 لازم تمنشن حدا حتى أقيّمه! مثل: .تقييم @الشخص'
            }, { quoted: msg });
        }

        const score = Math.floor(Math.random() * 101); // 0 إلى 100

        await sock.sendMessage(msg.key.remoteJid, {
            text: `📊 تقييم @${mentioned.split('@')[0]} هو: ${score}/100`,
            mentions: [mentioned]
        }, { quoted: msg });
    }
};