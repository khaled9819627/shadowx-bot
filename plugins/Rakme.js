const moment = require('moment-timezone');
const axios = require('axios');
const { getCountryCode } = require('../utils/countryUtil'); // سنوضحها تحت

module.exports = {
  command: 'رقمي',
  description: 'يعرض معلومات مفصلة عن رقمك.',
  category: 'معلومات',

  async execute(sock, msg) {
    const jid = msg.sender;
    const number = jid.split('@')[0];
    const mention = `@${number}`;
    const chatType = msg.key.remoteJid.endsWith('@g.us') ? 'مجموعة' : 'خاص';
    const time = moment().tz('Asia/Damascus').format('YYYY-MM-DD HH:mm:ss');
    const country = getCountryCode(number);

    // جلب الصورة الشخصية
    let pfp;
    try {
      pfp = await sock.profilePictureUrl(jid, 'image');
    } catch {
      pfp = 'https://i.imgur.com/U6XQ7YJ.png'; // صورة افتراضية
    }

    const caption = `
📱 معلوماتك:

╭───────────────
│ 👤 الاسم: ${mention}
│ ☎ الرقم: ${number}
│ 🏳 الدولة: ${country}
│ 💬 الوضع: ${chatType}
│ 🕒 الوقت: ${time}
╰───────────────
    `.trim();

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: pfp },
      caption: caption,
      mentions: [jid]
    }, { quoted: msg });
  }
};
