const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'جواب',
  description: 'تحقق من جوابك في لعبة العلم.',
  usage: '.جواب [اسم الدولة]',
  category: 'ألعاب',

  async execute(sock, msg) {
    try {
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const answer = text.split(' ').slice(1).join(' ').trim();
      if (!answer) {
        return sock.sendMessage(msg.key.remoteJid, { text: '❗ اكتب جوابك بعد الأمر.\nمثال: .جواب سوريا' }, { quoted: msg });
      }

      const user = (msg.key.participant || msg.key.remoteJid).split('@')[0];
      const file = path.join(__dirname, '..', 'tmp', `flag_${user}.json`);
      if (!fs.existsSync(file)) {
        return sock.sendMessage(msg.key.remoteJid, { text: '❗ ما طلبت علم بعد. استخدم .علم أولاً' }, { quoted: msg });
      }

      const data = JSON.parse(fs.readFileSync(file));
      const correct = data.answer.trim().toLowerCase();
      const yourAnswer = answer.trim().toLowerCase();

      if (yourAnswer === correct) {
        fs.unlinkSync(file); // نحذف الملف بعد الجواب
        return sock.sendMessage(msg.key.remoteJid, { text: `✅ صح! الجواب هو "${data.answer}" 🎉` }, { quoted: msg });
      } else {
        return sock.sendMessage(msg.key.remoteJid, { text: `❌ غلط! جرب مرة تانية.` }, { quoted: msg });
      }

    } catch (err) {
      console.error('❌ خطأ في أمر جواب:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار خطأ وأنا عم دقّق جوابك 😅'
      }, { quoted: msg });
    }
  }
};
