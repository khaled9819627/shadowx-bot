const { jidDecode } = require('@whiskeysockets/baileys');
const translate = require('@vitalets/google-translate-api');
const fs = require('fs');
const path = require('path');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'ترجم',
  description: 'ترجمة نص لأي لغة - أو عرض قائمة رموز اللغات المتاحة',
  usage: '.ترجم [رمز اللغة] [النص] أو .ترجم لغات',
  category: 'ذكاء',

  async execute(sock, msg) {
    const jid = msg.key.remoteJid;
    const sender = decode(msg.key.participant || jid);
    const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
    const args = body.trim().split(/\s+/).slice(1); // بعد .ترجم

    // عرض رموز اللغات من ملف خارجي
    if (args[0] && args[0].toLowerCase() === 'لغات') {
      const langsPath = path.join(__dirname, '..', 'languages.txt');
      if (!fs.existsSync(langsPath)) {
        return await sock.sendMessage(jid, { text: '❌ ملف اللغات غير موجود.' }, { quoted: msg });
      }

      const langs = fs.readFileSync(langsPath, 'utf-8');
      return await sock.sendMessage(jid, {
        document: Buffer.from(langs),
        fileName: 'رموز_اللغات.txt',
        mimetype: 'text/plain'
      }, { quoted: msg });
    }

    const lang = args[0];
    const text = args.slice(1).join(' ');

    if (!lang || !text) {
      return await sock.sendMessage(jid, {
        text: '❗ الاستخدام:\n.ترجم [رمز اللغة] [النص]\nمثال:\n.ترجم en مرحبا\n.ترجم ar hello\n\nلعرض رموز اللغات:\n.ترجم لغات'
      }, { quoted: msg });
    }

    try {
      const res = await translate(text, { to: lang });
      return await sock.sendMessage(jid, {
        text: `🔁 *ترجمة (${lang}):*\n\n${res.text}`
      }, { quoted: msg });
    } catch (err) {
      console.error('❌ خطأ في الترجمة:', err);
      return await sock.sendMessage(jid, {
        text: '❌ حدث خطأ أثناء الترجمة. تأكد من رمز اللغة والنص.'
      }, { quoted: msg });
    }
  }
};
