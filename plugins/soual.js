const axios = require('axios');

module.exports = {
  command: 'سؤال',
  description: 'أجب عن أي سؤال عام باستخدام الذكاء الاصطناعي.',
  usage: '.سؤال [نص]',
  category: 'ألعاب',

  async execute(sock, msg) {
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const query = body.split(' ').slice(1).join(' ');
    if (!query) return await sock.sendMessage(msg.key.remoteJid, { text: '❗ اكتب سؤالك بعد الأمر' }, { quoted: msg });

    try {
      const res = await axios.get(`https://api.akuari.my.id/ai/gpt?chat=${encodeURIComponent(query)}`);
      const answer = res.data?.respon || '❌ لم أتمكن من الحصول على إجابة.';
      await sock.sendMessage(msg.key.remoteJid, { text: answer }, { quoted: msg });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء جلب الرد.' }, { quoted: msg });
    }
  }
};
