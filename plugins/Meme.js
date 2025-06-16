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
      let meme, imageUrl;
      let attempts = 0;
      const maxAttempts = 5;

      // كرر المحاولة حتى تحصل على صورة أو تنتهي المحاولات
      while (attempts < maxAttempts) {
        const res = await axios.get('https://meme-api.com/gimme');
        meme = res.data;
        imageUrl = meme.url;
        if (/\.(jpg|jpeg|png)$/i.test(imageUrl)) break;
        attempts++;
      }

      // إذا لم يجد صورة مناسبة
      if (!/\.(jpg|jpeg|png)$/i.test(imageUrl)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: '❌ لم أستطع جلب صورة ميم مناسبة الآن، حاول لاحقًا.'
        }, { quoted: msg });
        return;
      }

      // تحميل الصورة مؤقتًا
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
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
