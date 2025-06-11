module.exports = {
    command: 'ش',
    description: 'يشيل الإشراف من جميع الأدمنية بالقروب ويرسل لهم وداعية 😂',
    category: 'إدارة',
    usage: '.ش',

    async execute(sock, msg) {
        const groupId = msg.key.remoteJid;

        // جلب بيانات القروب
        const metadata = await sock.groupMetadata(groupId);
        const participants = metadata.participants;

        // تأكد إن البوت مشرف
        const botNumber = (await sock.state.creds.me.id.split(':'))[0] + '@s.whatsapp.net';
        const botData = participants.find(p => p.id === botNumber);
        if (!botData || !botData.admin) {
            return sock.sendMessage(groupId, {
                text: '⚠️ لازم أكون مشرف بالقروب حتى أقدر أشيل الإشراف.',
            }, { quoted: msg });
        }

        // جلب الأدمنية (ما عدا البوت نفسه)
        const admins = participants.filter(p => p.admin && p.id !== botNumber);

        if (admins.length === 0) {
            return sock.sendMessage(groupId, {
                text: '✅ ما في أي أدمن غيري بالقروب.',
            }, { quoted: msg });
        }

        for (const admin of admins) {
            // سحب الإشراف
            await sock.groupParticipantsUpdate(groupId, [admin.id], 'demote');

            // إرسال رسالة خاصة له
            await sock.sendMessage(admin.id, {
                text: '👋 ودّع القروب يا أدمن، راحت الرتبة 😈'
            });
        }

        await sock.sendMessage(groupId, {
            text: `✅ تم سحب الإشراف من ${admins.length} مشرف.\n\nودّعوا كلكم ✌️`
        }, { quoted: msg });
    }
};