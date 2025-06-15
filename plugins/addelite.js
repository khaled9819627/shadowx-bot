const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'addelite',
  desc: 'إدارة قائمة النخبة الخاصة بك',
  usage: '[اضف +رقم] أو [حذف +رقم] أو [عرض]',
  
  async execute(sock, m) {
    const senderId = m.key.participant || m.key.remoteJid;
    const senderNumber = senderId.split('@')[0];
    
    const body = m.message?.conversation ||
                 m.message?.extendedTextMessage?.text ||
                 m.message?.imageMessage?.caption ||
                 m.message?.videoMessage?.caption || '';

    const text = body.trim().split(' ').slice(1).join(' ');
    const reply = async (msg) =>
      await sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });

    // 📁 تحديد مسار ملف النخبة الخاص بالمستخدم
    const getElitePath = () => {
      const dir = path.join(__dirname, '..', 'shadowx_data');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const file = `elite_${senderNumber}.json`;
      return path.join(dir, file);
    };

    const filePath = getElitePath();

    // تحميل وحفظ القائمة
    const loadList = () =>
      fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        : [];

    const saveList = (list) =>
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2));

    let list = loadList();

    if (!text) {
      return reply(
        `❗ الاستخدام:\n` +
        `.نخبة اضف +123456789\n` +
        `.نخبة حذف +123456789\n` +
        `.نخبة عرض`
      );
    }

    if (text.startsWith('اضف')) {
      const number = text.split(' ')[1];
      if (!number) return reply('❗ اكتب رقم بعد "اضف".');
      if (list.includes(number)) return reply('⚠️ الرقم موجود بالفعل في النخبة.');

      list.push(number);
      saveList(list);
      return reply(`✅ تمت إضافة ${number} إلى قائمة النخبة.`);
    }

    if (text.startsWith('حذف')) {
      const number = text.split(' ')[1];
      if (!number) return reply('❗ اكتب رقم بعد "حذف".');
      if (!list.includes(number)) return reply('⚠️ الرقم غير موجود في النخبة.');

      list = list.filter((n) => n !== number);
      saveList(list);
      return reply(`✅ تم حذف ${number} من قائمة النخبة.`);
    }

    if (text === 'عرض') {
      return reply(
        list.length
          ? `🔰 قائمة النخبة الخاصة بك:\n${list.join('\n')}`
          : '🚫 لا يوجد أي رقم في قائمة النخبة بعد.'
      );
    }

    return reply('❗ أمر غير مفهوم، استخدم: اضف، حذف، عرض');
  }
};
