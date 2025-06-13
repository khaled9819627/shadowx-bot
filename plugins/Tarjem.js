const translate = require('@vitalets/google-translate-api');

module.exports = {
  command: 'ترجم',
  description: 'يترجم النص لأي لغة تحددها (en, ar, fr, ...)',
  usage: '.ترجم [رمز_اللغة] [النص]',
  category: 'أدوات',

  async execute(sock, msg) {
    try {
      const body = msg.message?.conversation ||
                   msg.message?.extendedTextMessage?.text || '';

      const args = body.trim().split(/\s+/);
      if (args.length < 3) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❗ الصيغة الصحيحة:\n.ترجم [رمز_اللغة] [النص]\nمثال: `.ترجم en مرحبا`'
        }, { quoted: msg });
      }

      const targetLang = args[1].toLowerCase(); // اللغة المطلوبة
      const textToTranslate = args.slice(2).join(' '); // النص

      const result = await translate(textToTranslate, { to: targetLang });

      const detectedLang = result.from.language.iso;

      const response = `🌍 *من (${detectedLang}) إلى (${targetLang}):*\n\n${result.text}`;
      await sock.sendMessage(msg.key.remoteJid, { text: response }, { quoted: msg });

    } catch (err) {
      console.error('❌ خطأ في الترجمة:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء الترجمة. تأكد من رمز اللغة والنص.'
      }, { quoted: msg });
    }
  }
};
