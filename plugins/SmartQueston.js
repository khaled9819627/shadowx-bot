const fs = require('fs');
const path = require('path');

const questions = [
  { question: "شيء كلما أخذت منه كبر، ما هو؟", answer: "الحفرة" },
  { question: "ما الشيء الذي يسير بلا أرجل ولا يدخل إلا بالأذنين؟", answer: "الصوت" },
  { question: "ما هو الشيء الذي إذا وضعته في الثلاجة لا يبرد؟", answer: "الفلفل الحار" },
  { question: "يمشي بلا قدمين ولا يدخل إلا بالأذنين؟", answer: "الصوت" },
  { question: "ما هو الشيء الذي كلما زاد نقص؟", answer: "العمر" },
  { question: "ما هو الشيء الذي له وجه بلا لسان؟", answer: "الساعة" }
];

module.exports = {
  command: 'سؤال_ذكاء',
  description: 'يرسل لك سؤال ذكاء لتختبر نفسك.',
  usage: '.سؤال_ذكاء',
  category: 'ألعاب',

  async execute(sock, msg) {
    try {
      const random = questions[Math.floor(Math.random() * questions.length)];
      const user = (msg.key.participant || msg.key.remoteJid).split('@')[0];
      const file = path.join(__dirname, '..', 'tmp', `smart_${user}.json`);

      fs.writeFileSync(file, JSON.stringify(random));

      await sock.sendMessage(msg.key.remoteJid, {
        text: `🧠 سؤال ذكاء:\n\n${random.question}\n\n💡 جاوب باستخدام الأمر: .جوابي [الإجابة]`
      }, { quoted: msg });
    } catch (err) {
      console.error('❌ خطأ في أمر سؤال_ذكاء:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار خطأ وأنا عم حضّر السؤال 😅'
      }, { quoted: msg });
    }
  }
};
