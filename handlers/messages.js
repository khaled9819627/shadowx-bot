const config = require('../config');
const logger = require('../utils/console');
const { loadPlugins } = require('./plugins');

let pluginsCache = null;

async function handleMessages(sock, { messages }) {
    const msg = messages?.[0];
    if (!msg) return;

    const msgText = msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text ||
                    msg.message?.imageMessage?.caption ||
                    msg.message?.videoMessage?.caption || '';

    if (!msgText || !msgText.startsWith(config.prefix)) return;

    // معلومات أساسية
    msg.isGroup = msg.key.remoteJid.endsWith('@g.us');
    msg.sender = msg.key.participant || msg.key.remoteJid;
    msg.chat = msg.key.remoteJid;

    // دالة reply جاهزة
    msg.reply = async (text) => {
        try {
            await sock.sendMessage(msg.chat, { text }, { quoted: msg });
        } catch (err) {
            logger.error('✗ فشل في إرسال الرد:', err.message);
        }
    };

    const args = msgText.slice(config.prefix.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    try {
        // تحميل أوامر البوت مرة واحدة
        if (!pluginsCache) pluginsCache = await loadPlugins();
        const plugin = pluginsCache[command];

        if (!plugin || typeof plugin.execute !== 'function') {
            logger.warn(`❌ أمر غير معروف: ${command}`);
            return;
        }

        logger.info(`📥 أمر: ${command} | من: ${msg.sender}`);

        await plugin.execute(sock, msg, args);
        logger.success(`✅ تم تنفيذ الأمر: ${command}`);
        
    } catch (error) {
        logger.error(`✗ خطأ أثناء تنفيذ ${command}: ${error.message}`);
        msg.reply(config.messages?.error || 'حدث خطأ أثناء التنفيذ.');
    }
}

module.exports = {
    handleMessages
};
