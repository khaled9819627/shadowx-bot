const fs = require('fs');
const path = require('path');

const emojis = [
  { emoji: "🍎📱", answer: "آيفون" },
  { emoji: "🚗💨", answer: "سباق" },
  { emoji: "🌧️☔", answer: "مطر" },
  { emoji: "👑🐯", answer: "الملك الأسد" },
  { emoji: "👨‍🏫📚", answer: "مدرس" },
  { emoji: "🍔🍟🥤", answer: "وجبة سريعة" },
  { emoji: "🎬🍿", answer: "فيلم" },
  { emoji: "🛫🗺️", answer: "سفر" },
  { emoji: "🧛🦇", answer: "مصاص دماء" },
  { emoji: "🌍🚀", answer: "فضاء" }
];

module.exports = {
  command: 'ايموجي',
  description: 'يرسل سلسلة إيموجي والمطلوب تخمين المعنى.',
  usage: '.ايموجي',
  category: 'ألعاب',

  async execute(sock, msg) {
    try {
      const random = emojis[Math.floor(Math.random() * emojis.length)];
      const user = (msg.key.participant || msg.key.remoteJid).split('@')[0];
      const file = path.join(__dirname, '..', 'tmp', `emoji_${user}.json`);

      fs.writeFileSync(file, JSON.stringify(random));

      await sock.sendMessage(msg.key.remoteJid, {
        text: `🧩 خمن الكلمة:\n\n${random.emoji}\n\n💡 جاوب باستخدام: .تخمين [كلمتك]`,
      }, { quoted: msg });
    } catch (err) {
      console.error('❌ خطأ في أمر ايموجي:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار خطأ أثناء توليد التحدي 😅',
      }, { quoted: msg });
    }
  }
};
