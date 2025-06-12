const axios = require('axios');

module.exports = {
  command: 'ملخص',
  description: 'يلخص محتوى صفحة أو مقال من الإنترنت.',
  usage: '.ملخص [رابط]',
  category: 'أدوات',

  async execute(sock, msg) {
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const url = body.split(' ')[1];
    if (!url) return await sock.sendMessage(msg.key.remoteJid, { text: '❗ أرسل رابط بعد الأمر.' }, { quoted: msg });

    try {
      const res = await axios.get(`https://api.smmry.com/&SM_API_KEY=demo&SM_URL=${encodeURIComponent(url)}`);
      const summary = res.data?.sm_api_content || '❌ لم أتمكن من تلخيص الرابط.';
      await sock.sendMessage(msg.key.remoteJid, { text: summary }, { quoted: msg });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء التلخيص.' }, { quoted: msg });
    }
  }
};
