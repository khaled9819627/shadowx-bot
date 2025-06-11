module.exports = {
    command: 'ك',
    description: 'يكرر الرسالة اللي رديت عليها حسب العدد، مع منشن اختياري',
    category: 'أدوات',
    usage: '.ك <عدد> @شخص (رد على رسالة)',

    async execute(sock, msg) {
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const args = body.trim().split(/\s+/);
        const count = parseInt(args[1]);

        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentionJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        // تحقق من الرد
        if (!quotedMsg) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '❗ لازم ترد على رسالة عشان أكررها.',
            }, { quoted: msg });
        }

        // تحقق من العدد
        if (!count || isNaN(count) || count < 1 || count > 20) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '❗ اكتب عدد بين 1 و 20 مثل: .ك 6 @شخص',
            }, { quoted: msg });
        }

        // جلب نص الرسالة
        const text = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text;
        if (!text) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ما قدرت أقرأ الرسالة اللي رديت عليها.',
            }, { quoted: msg });
        }

        // حضّر النص
        const mentionTag = mentionJid ? `@${mentionJid.split('@')[0]} ` : '';
        const messageText = `${mentionTag}${text}`;

        // أرسل الرسالة مكررة مع تأخير
        for (let i = 0; i < count; i++) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: messageText,
                mentions: mentionJid ? [mentionJid] : []
            });
            await delay(500); // تأخير 0.5 ثانية
        }
    }
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}