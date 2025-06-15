const { addEliteNumber, removeEliteNumber, getEliteList } = require('../haykala/elite');
const config = require('../config');

module.exports = {
  command: 'نخبة',
  desc: 'إدارة قائمة النخبة الخاصة بك (اضف، حذف، عرض)',
  usage: '[اضف +رقم] أو [حذف +رقم] أو [عرض]',
  async execute(sock, m) {
    const sender = m.key.participant || m.key.remoteJid;
    const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    const args = body.trim().split(/\s+/).slice(1);

    const reply = async (msg) => await sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });

    if (args.length === 0) {
      return reply(`❗ استخدم:\nنخبة اضف +123456789\nنخبة حذف +123456789\nنخبة عرض`);
    }

    const ownerNumber = config.owners[0]; // رقمك من ملف config.js

    const action = args[0].toLowerCase();

    if (action === 'اضف') {
      const number = args[1]?.replace(/\D/g, '');
      if (!number) return reply('❗ اكتب رقم بعد "اضف".');
      const added = addEliteNumber(ownerNumber, number);
      if (!added) return reply('⚠️ الرقم موجود بالفعل في النخبة.');
      return reply(`✅ تمت إضافة ${number} إلى النخبة.`);
    }

    if (action === 'حذف') {
      const number = args[1]?.replace(/\D/g, '');
      if (!number) return reply('❗ اكتب رقم بعد "حذف".');
      const removed = removeEliteNumber(ownerNumber, number);
      if (!removed) return reply('⚠️ الرقم غير موجود في النخبة.');
      return reply(`✅ تم حذف ${number} من النخبة.`);
    }

    if (action === 'عرض') {
      const list = getEliteList(ownerNumber);
      if (list.length === 0) return reply('🚫 لا يوجد نخبة بعد.');
      return reply(`🔰 قائمة النخبة:\n${list.join('\n')}`);
    }

    return reply('❗ أمر غير مفهوم، استخدم: اضف، حذف، عرض');
  }
};
