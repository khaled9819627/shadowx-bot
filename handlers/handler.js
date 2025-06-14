const { extractPureNumber } = require('../haykala/elite');
const commands = {
    نخبة: require('../plugins/addelite'),
    // أضف هنا باقي أوامرك
};

async function handleMessages(sock, msg) {
    try {
        // التحقق من وجود المفتاح key أولاً
        if (!msg.key) return;

        // participant يأتي فقط في جروب، لذا تحقق إذا موجود
        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        if (!senderJid) return;

        const senderNumber = extractPureNumber(senderJid);

        // جلب نص الرسالة بأكثر من طريقة
        const messageText =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            '';

        // تأكد أن الرسالة تبدأ بالنقطة (.) وهي علامة الأمر
        if (!messageText.startsWith('.')) return;

        // تفكيك النص إلى أجزاء
        const parts = messageText.trim().split(/\s+/);
        const commandName = parts[0].slice(1).toLowerCase(); // حذف النقطة وتحويل للاسم الصغير

        const command = commands[commandName];
        if (!command) return;

        // تمرير sock, msg, args (الأجزاء بدون الأمر نفسه)
        const args = parts.slice(1);

        // تنفيذ الأمر مع تمرير الوسيطات الضرورية
        await command.execute(sock, msg, args);

    } catch (err) {
        console.error('✗ Error handling message:', err);
    }
}

module.exports = {
    handleMessages,
};
