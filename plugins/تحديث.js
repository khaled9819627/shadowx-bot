const { exec } = require('child_process');

module.exports = {
  command: 'تحديث',
  description: 'يسحب آخر تحديث من GitHub ويعيد تشغيل البوت.',
  category: 'أوامر المطور',

  async execute(sock, msg) {
    const sender = (msg.sender || msg.key.participant || msg.key.remoteJid).split('@')[0];

    if (sender !== '963968552137') {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ هذا الأمر مخصص للمطور فقط.'
      }, { quoted: msg });
    }

    await sock.sendMessage(msg.key.remoteJid, {
      text: '🔄 جاري التحديث من GitHub...\nقد يتوقف البوت للحظات.'
    }, { quoted: msg });

    exec('git pull && npm install --legacy-peer-deps', (err, stdout, stderr) => {
      if (err) {
        sock.sendMessage(msg.key.remoteJid, {
          text: `❌ فشل في التحديث:\n${stderr}`
        }, { quoted: msg });
        return;
      }

      sock.sendMessage(msg.key.remoteJid, {
        text: `✅ تم سحب التحديث:\n${stdout}\n🔁 جارٍ إعادة تشغيل البوت...`
      }, { quoted: msg });

      exec('pm2 restart all', (e) => {
        if (e) {
          exec('node .'); // fallback إذا ما فيه pm2
        }
      });
    });
  }
};
