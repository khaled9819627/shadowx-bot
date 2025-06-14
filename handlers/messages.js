const config = require('../config');
const logger = require('../utils/console');
const { loadPlugins } = require('./plugins');
const crypto = require('crypto');
const { isSpamming } = require('../utils/antiSpam');

async function handleMessages(sock, { messages }) {
    if (!messages || !messages[0]) return;

    const msg = messages[0];

    // تأكد من وجود msg.key و msg.key.remoteJid
    if (!msg.key || !msg.key.remoteJid) return;

    try {
        const messageText = msg.message?.conversation ||
                            msg.message?.extendedTextMessage?.text ||
                            msg.message?.imageMessage?.caption ||
                            msg.message?.videoMessage?.caption || '';

        msg.isGroup = msg.key.remoteJid.endsWith('@g.us');
        // participant موجود في رسائل الجروب، وإلا استخدم remoteJid (لمحادثة خاصة)
        msg.sender = msg.key.participant || msg.key.remoteJid;
        const senderId = msg.sender.split('@')[0];  // رقم المرسل فقط بدون @

        if (isSpamming(senderId)) {
            logger.warn(`🚫 تم تجاهل أمر من ${senderId} بسبب السبام.`);
            return; // إيقاف تنفيذ الأمر لمنع السبام
        }

        msg.chat = msg.key.remoteJid;

        msg.reply = async (text) => {
            try {
                await sock.sendMessage(msg.chat, { text }, { quoted: msg });
            } catch (error) {
                logger.error('خطأ في إرسال الرد:', error);
            }
        };

        if (!messageText.startsWith(config.prefix)) return;

        const args = messageText.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift()?.toLowerCase();

        const plugins = await loadPlugins();
        const plugin = plugins[command];

        if (plugin) {
            logger.info(`تنفيذ الأمر: ${command} من ${msg.sender}`);
            try {
                await plugin.execute(sock, msg, args);
            } catch (error) {
                logger.error(`خطأ في تنفيذ الأمر ${command}:`, error);
                await sock.sendMessage(msg.chat, {
                    text: config.messages.error
                }, { quoted: msg });
            }
        } else {
            logger.warn(`أمر غير معروف: ${command}`);
        }

    } catch (error) {
        logger.error('خطأ في معالجة الرسالة:', error);
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: config.messages.error
            });
        } catch (sendError) {
            logger.error('فشل في إرسال رسالة الخطأ:', sendError);
        }
    }
}

module.exports = {
    handleMessages
};
