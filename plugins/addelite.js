const {
    isElite,
    addEliteNumber,
    removeEliteNumber,
    getEliteList
} = require('../haykala/user_elite_manager');
const { extractPureNumber } = require('../haykala/elite'); // فقط لاستخراج الرقم

module.exports = {
    command: 'نخبة',
    description: 'إضافة أو إزالة رقم من نخبة خاصة بك أو عرضها',
    usage: '.نخبة اضف/ازل/عرض + منشن أو رد أو رقم',
    category: 'زرف',

    async execute(sock, msg) {
        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const senderNumber = extractPureNumber(senderJid);
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const parts = text.trim().split(/\s+/);
        const action = parts[1];

        if (!action || !['اضف', 'ازل', 'عرض'].includes(action)) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '❌ استخدم: .نخبة اضف/ازل مع منشن أو رد أو رقم، أو .نخبة عرض.'
            }, { quoted: msg });
        }

        if (action === 'عرض') {
            const list = getEliteList(senderNumber);
            const view = list.map((n, i) => `${i + 1}. ${n}`).join('\n');
            return sock.sendMessage(msg.key.remoteJid, {
                text: `👑 قائمة نخبتك:\n\n${view || 'لا يوجد أرقام بعد.'}`
            }, { quoted: msg });
        }

        let targetNumber;
        if (parts[2] && /^\d{5,}$/.test(parts[2])) {
            targetNumber = extractPureNumber(parts[2]);
        }

        if (!targetNumber) {
            const targetJid =
                msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                msg.message?.extendedTextMessage?.contextInfo?.participant;

            if (!targetJid) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ يجب منشن أو الرد على الشخص المستهدف أو إدخال رقم صحيح.'
                }, { quoted: msg });
            }

            targetNumber = extractPureNumber(targetJid);
        }

        const currentList = getEliteList(senderNumber);

        if (action === 'اضف') {
            if (currentList.includes(targetNumber)) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: `⚠️ الرقم ${targetNumber} موجود بالفعل في نخبتك.`
                }, { quoted: msg });
            }

            addEliteNumber(senderNumber, targetNumber);
            return sock.sendMessage(msg.key.remoteJid, {
                text: `✅ تم إضافة ${targetNumber} إلى نخبتك.`
            }, { quoted: msg });
        }

        if (action === 'ازل') {
            if (!currentList.includes(targetNumber)) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: `⚠️ الرقم ${targetNumber} غير موجود في نخبتك.`
                }, { quoted: msg });
            }

            removeEliteNumber(senderNumber, targetNumber);
            return sock.sendMessage(msg.key.remoteJid, {
                text: `✅ تم إزالة ${targetNumber} من نخبتك.`
            }, { quoted: msg });
        }
    }
};
