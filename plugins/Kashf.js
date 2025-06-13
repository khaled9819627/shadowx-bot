const { jidDecode } = require('@whiskeysockets/baileys');

const decode = (jid) => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'كشف',
  description: 'يكشف إذا كان الرقم حقيقي أو مزيف بناءً على سلوكه.',
  usage: '.كشف [رد على رقم]',
  category: 'أمان',

  async execute(sock, msg) {
    try {
      const jid = msg.key.remoteJid;
      const reply = msg.message?.extendedTextMessage?.contextInfo?.participant;
      
      if (!reply) {
        return await sock.sendMessage(jid, {
          text: '❗ لازم ترد على رسالة الشخص اللي بدك تكشفه.\n\nمثال: رد على رسالته واكتب `.كشف`',
        }, { quoted: msg });
      }

      const number = decode(reply);
      let result = `🕵️‍♂️ *نتيجة الكشف عن:* ${number.split('@')[0]}\n\n`;

      try {
        // تحقق من وجود صورة شخصية
        await sock.profilePictureUrl(number, 'image');
        result += '✅ عنده صورة شخصية.\n';
      } catch {
        result += '❌ ما عنده صورة شخصية.\n';
      }

      try {
        // تحقق من وجود اسم
        const name = await sock.getName(number);
        result += name ? '✅ عنده اسم ظاهر.\n' : '❌ ما عنده اسم ظاهر.\n';
      } catch {
        result += '❌ ما قدرنا نجيب اسمه.\n';
      }

      // تحقق من طوله (مزيف إذا كان قصير أو مكرر)
      const num = number.split('@')[0];
      if (/(\d)\1{5,}/.test(num)) {
        result += '⚠️ الرقم فيه تكرار مشبوه.\n';
      }

      if (num.length < 9) {
        result += '⚠️ الرقم قصير وغير معتاد.\n';
      }

      result += '\n*⚠️ هذا الفحص تقريبي وليس مضمون 100%.*';

      await sock.sendMessage(jid, { text: result }, { quoted: msg });
    } catch (err) {
      console.error('❌ خطأ في أمر كشف:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار خطأ أثناء تنفيذ أمر الكشف.',
      }, { quoted: msg });
    }
  }
};
