const fs = require('fs');
const path = require('path');
const config = require('../config.js');
const { isElite } = require('../haykala/elite.js'); 

const configPath = path.join(__dirname, '../config.js');

module.exports = {
  command: 'بريفكس',
  description: 'تغيير البريفكس الخاص بالأوامر (النخبة فقط)',
  usage: '.بريفكس [رمز جديد]',
  category: 'tools',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const sender = senderJid.split('@')[0];

    if (typeof isElite !== 'function' || !isElite(sender)) {
      return sock.sendMessage(chatId, {
        text: config.messages.ownerOnly
      }, { quoted: msg });
    }

    const fullText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const currentPrefix = config.prefix || config.defaultPrefix || '.';
    const input = fullText.startsWith(currentPrefix)
      ? fullText.slice((currentPrefix + 'بريفكس').length).trim()
      : '';

    if (!input) {
      return sock.sendMessage(chatId, {
        text: '❌ الرجاء كتابة البريفكس الجديد.\nمثال: .بريفكس $ أو .بريفكس فارغ'
      }, { quoted: msg });
    }

    const newPrefix = (input === 'فارغ') ? '' : input;
    config.prefix = newPrefix;

    const updatedContent = `let prefix = '${newPrefix}';

module.exports = {
    botName: '𝐒𝐇𝐀𝐃𝐎𝐖 𝐗',
    version: '2.5.0',
    owner: '963968552137',

    defaultPrefix: '.',
    get prefix() {
        return prefix;
    },
    set prefix(newPrefix) {
        if (newPrefix && typeof newPrefix === 'string') {
            prefix = newPrefix;
        }
    },

    allowedGroups: [],

    messages: {
        error: '❌ حدث خطأ أثناء تنفيذ الأمر',
        noPermission: 'ليس لديك صلاحية لاستخدام هذا الأمر',
        groupOnly: 'هذا الأمر متاح فقط في المجموعات',
        ownerOnly: 'هذا الأمر متاح فقط للنخبة',
        notAllowedGroup: 'عذراً، البوت لا يعمل في هذه المجموعة'
    },

    colors: {
        success: '\\x1b[32m',
        error: '\\x1b[31m',
        info: '\\x1b[36m',
        warn: '\\x1b[33m',
        reset: '\\x1b[0m'
    }
};
`;

    fs.writeFileSync(configPath, updatedContent);

    const display = newPrefix === '' ? 'فارغ' : `(${newPrefix})`;
    let response = `✅ تم تغيير البريفكس إلى ${display}`;
    if (newPrefix === '') {
      response += `\n⚠️ يجب إعادة تشغيل البوت لتفعيل البريفكس الفارغ.`;
    }

    return sock.sendMessage(chatId, { text: response }, { quoted: msg });
  }
};