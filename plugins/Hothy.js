const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'حظي',
  description: 'يعطيك نسبة حظك اليوم بطريقة سورية ممتعة.',
  usage: '.حظي',
  category: 'تفاعل',

  async execute(sock, msg) {
    try {
      const sender = decode(msg.key.participant || msg.key.remoteJid);
      const percentage = Math.floor(Math.random() * 101); // من 0 إلى 100

      let comment = '🤔 يعني هيك وهيك... عيش يومك بس.';
      if (percentage >= 90) comment = '🔥 آآآخ يا ابن المحظوظة! اليوم يومك.';
      else if (percentage >= 75) comment = '🌟 حظك نار، روح العب يا بطل!';
      else if (percentage >= 50) comment = '👌 تمام، ماشي حالك اليوم.';
      else if (percentage >= 30) comment = '💤 نص نص، دير بالك لا تنعجق.';
      else if (percentage >= 10) comment = '💩 حظك مطفي متل الكهربا.';
      else comment = '😵 بلا حظ بلا بطيخ، نام أحسنلك 😂';

      const reply = `🧿 *حظك اليوم:* ${percentage}%\n\n${comment}`;
      await sock.sendMessage(msg.key.remoteJid, { text: reply }, { quoted: msg });

    } catch (err) {
      console.error('❌ خطأ في أمر حظي:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار غلط وأنا عم احسب حظك'
      }, { quoted: msg });
    }
  }
};
