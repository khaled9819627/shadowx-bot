const axios = require('axios');

module.exports = {
  command: 'ميم',
  description: 'يرسل ميم عشوائي (مضحك).',
  usage: '.ميم',
  category: 'تفاعل',

  async execute(sock, msg) {
    try {
      const res = await axios.get('https://meme-api.com/gimme');
      const meme = res.data;

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: meme.url },
        caption: `😂 ${meme.title}`
      }, { quoted: msg });
    } catch (error) {
      console.error('❌ خطأ في أمر الميم:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء جلب الميم، حاول لاحقًا.'
      }, { quoted: msg });
    }
  }
};
