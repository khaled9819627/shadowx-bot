const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'ميم',
  description: 'يرسل ميم عشوائي (مضحك).',
  usage: '.ميم',
  category: 'تفاعل',

  async execute(sock, msg) {
    try {
      // جلب الميم من API
      const res = await axios.get('https://meme-api.com/gimme');
      const meme = res.data;

      // التحقق من أن الرابط صورة فقط
      if (!/\.(jpg|jpeg|png)$/i.test(meme.url)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: '❌ الميم ليس صورة، حاول مرة أخرى.'
        }, { quoted: msg });
        return;
      }

      // تحميل الصورة مؤقتًا
      const response = await axios.get(meme.url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      const tempPath = path.join(__dirname, `meme_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, buffer);

      // إرسال الصورة
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: tempPath },
        caption: `😂 ${meme.title}`
      }, { quoted: msg });

      // حذف الصورة المؤقتة
      fs.unlinkSync(tempPath);

    } catch (error) {
      console.error('❌ خطأ في أمر الميم:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء جلب أو إرسال الميم، حاول لاحقًا.'
      }, { quoted: msg });
    }
  }
};
