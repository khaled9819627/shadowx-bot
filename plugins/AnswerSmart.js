const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'جوابي',
  description: 'يرد على سؤال الذكاء السابق.',
  usage: '.جوابي [الإجابة]',
  category: 'ألعاب',

  async execute(sock, msg) {
    try {
      const user = (msg.key.participant || msg.key.remoteJid).split('@')[0];
      const file = path.join(__dirname, '..', 'tmp', `smart_${user}.json`);
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const userAnswer = text.split(' ').slice(1).join(' ').trim().toLowerCase();

      if (!fs.existsSync(file)) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❗ ما في سؤال حالياً، اكتب `.سؤال_ذكاء` أولاً.',
        }, { quoted: msg });
      }

      if (!userAnswer) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❗ اكتب إجابتك بعد الأمر.\nمثال: .جوابي الصوت',
        }, { quoted: msg });
      }

      const data = JSON.parse(fs.readFileSync(file));
      const correctAnswer = data.answer.trim().toLowerCase();

      if (userAnswer === correctAnswer) {
        fs.unlinkSync(file); // حذف السؤال بعد الإجابة الصحيحة
        return sock.sendMessage(msg.key.remoteJid, {
          text: `✅ صح! الجواب هو: ${data.answer} 🎉`,
        }, { quoted: msg });
      } else {
        return sock.sendMessage(msg.key.remoteJid, {
          text: `❌ خطأ! جرب كمان مرة.`,
        }, { quoted: msg });
      }
    } catch (err) {
      console.error('❌ خطأ في أمر جوابي:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار خطأ أثناء التحقق من الجواب 😅',
      }, { quoted: msg });
    }
  }
};
