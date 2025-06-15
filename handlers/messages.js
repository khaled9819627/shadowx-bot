const { loadPlugins } = require('./plugins');
const config = require('../config');
const logger = require('../utils/console');
const fs = require('fs');
const path = require('path');
const { isElite } = require('../haykala/elite'); // غيّر المسار حسب مكان ملفك

async function handleMessages(sock, { messages }) {
    if (!messages || !messages[0]) return;

    const msg = messages[0];

    try {
        const text = msg.message?.conversation ||
                     msg.message?.extendedTextMessage?.text ||
                     msg.message?.imageMessage?.caption ||
                     msg.message?.videoMessage?.caption || '';

        if (!text || !text.startsWith(config.prefix)) return;

        const args = text.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift()?.toLowerCase();
        if (!command) return;

        const isGroup = msg.key.remoteJid.endsWith('@g.us');
        const sender = isGroup ? msg.key.participant?.split('@')[0] : msg.key.remoteJid.split('@')[0];
        const chatId = msg.key.remoteJid;

        // إعداد الرسالة للتعامل مع الأوامر
        msg.isGroup = isGroup;
        msg.sender = sender;
        msg.chat = chatId;
        msg.args = args;
        msg.command = command;
        msg.prefix = config.prefix;

        msg.reply = async (text) => {
            try {
                await sock.sendMessage(chatId, { text }, { quoted: msg });
            } catch (err) {
                logger.error('خطأ في إرسال الرد:', err.message);
            }
        };

        // تحقق حالة البوت
        const botStatusPath = path.join(__dirname, '../data/bot.txt');
        if (fs.existsSync(botStatusPath)) {
            const status = fs.readFileSync(botStatusPath, 'utf8').trim();
            if (status === '[off]' && command !== 'bot') {
                logger.warn(`📛 البوت متوقف - تجاهل الأمر ${command}`);
                return;
            }
        }

        // تحقق وضع النخبة
        const eliteModePath = path.join(__dirname, '../data/mode.txt');
        let eliteMode = false;
        if (fs.existsSync(eliteModePath)) {
            eliteMode = fs.readFileSync(eliteModePath, 'utf8').trim() === '[on]';
        }

        const botNumber = sock.user.id.split(':')[0].replace(/\D/g, '');
        if (eliteMode && !isElite(sender, botNumber)) {
            logger.warn(`❌ تجاهل من غير النخبة: ${sender}`);
            return msg.reply('❌ أنت غير مخوّل لاستخدام هذه الأوامر.');
        }

        // تحميل الأوامر
        const plugins = await loadPlugins();
        const handler = plugins[command];
        if (!handler) {
            logger.warn(`🚫 أمر غير معروف: ${command}`);
            return;
        }

        // تحقق صلاحيات إضافية
        if (handler.owner && !config.owners.includes(sender)) {
            return msg.reply(config.messages.ownerOnly || '❌ هذا الأمر خاص بالمطور فقط.');
        }

        if (handler.group && !isGroup) {
            return msg.reply(config.messages.groupOnly || '❌ هذا الأمر يعمل فقط في المجموعات.');
        }

        // تنفيذ الأمر
        if (typeof handler.execute === 'function') {
            await handler.execute(sock, msg, args);
            logger.success(`✅ تم تنفيذ الأمر: ${command}`);
        } else {
            logger.warn(`⚠️ المعالج لا يحتوي على execute: ${command}`);
        }

    } catch (error) {
        logger.error('❌ خطأ في معالجة الرسالة:', error);
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: config.messages.error || '❌ حدث خطأ أثناء تنفيذ الأمر.'
            }, { quoted: msg });
        } catch (err) {
            logger.error('فشل في إرسال رسالة الخطأ:', err.message);
        }
    }
}

module.exports = {
    handleMessages
};
