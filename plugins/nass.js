const { default: axios } = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createWorker } = require('tesseract.js');

module.exports = {
  command: 'نص',
  description: 'استخراج النص من صورة.',
  usage: '.نص (رد على صورة)',
  category: 'أدوات',

  async execute(sock, msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isImage = quoted?.imageMessage;

    if (!isImage) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❗ قم بالرد على صورة لاستخراج النص منها.' }, { quoted: msg });
    }

    try {
      const media = await sock.downloadMediaMessage({ message: { imageMessage: isImage } });
      const tempPath = path.join(__dirname, `../temp_${Date.now()}.jpg`);
      await fs.writeFile(tempPath, media);

      const worker = await createWorker('eng+ara'); // يدعم الإنجليزية والعربية
      const {
        data: { text },
      } = await worker.recognize(tempPath);
      await worker.terminate();
      await fs.unlink(tempPath);

      await sock.sendMessage(msg.key.remoteJid, { text: `📝 النص المستخرج:\n\n${text.trim() || '❌ لم يتم العثور على نص واضح.'}` }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء تحليل الصورة.' }, { quoted: msg });
    }
  }
};
