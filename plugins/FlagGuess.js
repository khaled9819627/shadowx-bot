const flags = [
  { country: "السعودية", emoji: "🇸🇦" },
  { country: "سوريا", emoji: "🇸🇾" },
  { country: "مصر", emoji: "🇪🇬" },
  { country: "فلسطين", emoji: "🇵🇸" },
  { country: "الجزائر", emoji: "🇩🇿" },
  { country: "المغرب", emoji: "🇲🇦" },
  { country: "تونس", emoji: "🇹🇳" },
  { country: "تركيا", emoji: "🇹🇷" },
  { country: "ألمانيا", emoji: "🇩🇪" },
  { country: "فرنسا", emoji: "🇫🇷" },
  { country: "إيطاليا", emoji: "🇮🇹" },
  { country: "أمريكا", emoji: "🇺🇸" },
  { country: "بريطانيا", emoji: "🇬🇧" },
  { country: "البرازيل", emoji: "🇧🇷" },
  { country: "الهند", emoji: "🇮🇳" },
  { country: "اليابان", emoji: "🇯🇵" },
  { country: "كوريا الجنوبية", emoji: "🇰🇷" },
];

module.exports = {
  command: 'علم',
  description: 'يُظهر علم دولة والمستخدم يخمّن اسمها.',
  usage: '.علم',
  category: 'ألعاب',

  async execute(sock, msg) {
    try {
      const random = flags[Math.floor(Math.random() * flags.length)];
      const prompt = `🌍 خمن اسم الدولة من هذا العلم:\n\n${random.emoji}`;

      // نحفظ اسم الدولة الصحيحة في ملف مؤقت حسب المستخدم
      const user = (msg.key.participant || msg.key.remoteJid).split('@')[0];
      const fs = require('fs');
      const path = require('path');
      const tmpFile = path.join(__dirname, '..', 'tmp', `flag_${user}.json`);
      fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
      fs.writeFileSync(tmpFile, JSON.stringify({ answer: random.country }));

      await sock.sendMessage(msg.key.remoteJid, { text: prompt }, { quoted: msg });
    } catch (err) {
      console.error('❌ خطأ في أمر علم:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار شي غلط وأنا عم دور على العلم 😅'
      }, { quoted: msg });
    }
  }
};
