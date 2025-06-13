const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'تخمين',
  description: 'يجاوب على تحدي الإيموجي.',
  usage: '.تخمين [الكلمة]',
  category: 'ألعاب',

  async execute(sock, msg) {
    try {
      const user = (msg.key.participant || msg.key.remoteJid).split('@')[0];
      const file = path.join(__dirname, '..', 'tmp', `emoji_${user}.json`);
      const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const userGuess = body.split(' ').slice(1).join(' ').trim().toLowerCase();

      if (!fs.existsSync(file)) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❗ ما في تحدي حالي. اكتب `.ايموجي` للبدء.',
        }, { quoted: msg });
      }

      if (!userGuess) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❗ اكتب الكلمة بعد الأمر.\nمثال: .تخمين سفر',
        }, { quoted: msg });
      }

      const data = JSON.parse(fs.readFileSync(file));
      const correct = data.answer.trim().toLowerCase();

      if (userGuess === correct) {
        fs.unlinkSync(file);
        return await sock.sendMessage(msg.key.remoteJid, {
          text: `✅ صح! الجواب كان: ${data.answer} 🎉`,
        }, { quoted: msg });
      } else {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ غلط! جرب مرة تانية.`,
        }, { quoted: msg });
      }
    } catch (err) {
      console.error('❌ خطأ في أمر التخمين:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار خطأ أثناء التحقق من الجواب.',
      }, { quoted: msg });
    }
  }
};
