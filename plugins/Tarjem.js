const translate = require('@vitalets/google-translate-api');

module.exports = {
  command: 'ترجم',
  description: 'يترجم النصوص إلى لغة أخرى تلقائيًا.',
  usage: '.ترجم [النص]',
  category: 'أدوات',

  async execute(sock, msg) {
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const args = body.trim().split(' ').slice(1);
    const text = args.join(' ');
    
    if (!text) {
      return await sock.sendMessage(
        msg.key.remoteJid, 
        { text: '❗ اكتب نصًا بعد الأمر لترجمته.' }, 
        { quoted: msg }
      );
    }

    try {
      const res = await translate(text, { to: 'ar' });
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `🌍 الترجمة:\n${res.text}` },
        { quoted: msg }
      );
    } catch (error) {
      console.error('Translation error:', error);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: '❌ تعذر الترجمة حالياً.' },
        { quoted: msg }
      );
    }
  }
};
