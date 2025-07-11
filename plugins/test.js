
module.exports = {
    command: 'تست',
    description: 'اختبار البوت',
    usage: '.test',
    category: 'أدوات',    
    
    async execute(sock, msg) {
        try {
            const decoratedText = ` 𝐒𝐇𝐀𝐃𝐎𝐖 𝐗 𝐁𝐎𝐓 𝐈𝐒 𝐖𝐎𝐑𝐊𝐈𝐍𝐆 𝐍𝐎𝐖`;
            await sock.sendMessage(msg.key.remoteJid, {
                text: decoratedText,
                mentions: [msg.sender]
            }, { quoted: msg });
        } catch (error) {
            console.error('❌', 'Error executing test:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: responses.error.general(error.message || error.toString())
            }, { quoted: msg });
        }
    }
};
