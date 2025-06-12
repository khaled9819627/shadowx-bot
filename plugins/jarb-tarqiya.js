module.exports = {
  command: 'فحص_الترقية',
  category: 'أمان',
  description: '🔒 يقوم بفحص ما إذا كان البوت قادرًا على ترقية نفسه بدون صلاحيات.',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;

    // دالة delay مدمجة داخل البلقن
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
      const metadata = await sock.groupMetadata(chatId);
      const botId = sock.user.id + '@s.whatsapp.net';

      const participant = metadata.participants.find(p => p.id === botId);

      if (participant?.admin === 'admin' || participant?.admin === 'superadmin') {
        return sock.sendMessage(chatId, {
          text: '✅ البوت حالياً مشرف بالفعل.'
        }, { quoted: msg });
      }

      await sock.sendMessage(chatId, {
        text: '🔍 جاري محاولة الترقية...'
      }, { quoted: msg });

      // محاولة الترقية (هنا نتوقع الفشل، إلا لو فيه ثغرة)
      await sock.groupParticipantsUpdate(chatId, [botId], 'promote');

      // ننتظر شوية عشان يصير التحقق بعد محاولة الترقية
      await delay(2000);

      const updated = await sock.groupMetadata(chatId);
      const updatedBot = updated.participants.find(p => p.id === botId);

      if (updatedBot?.admin === 'admin' || updatedBot?.admin === 'superadmin') {
        await sock.sendMessage(chatId, {
          text: '🚨 تم ترقية البوت بدون صلاحيات! هناك احتمال وجود ثغرة ⚠️'
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, {
          text: '✅ فشل الفحص: لا توجد ثغرات. الترقية لم تتم كما هو متوقع.'
        }, { quoted: msg });
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('forbidden')) {
        return sock.sendMessage(chatId, {
          text: '✅ الترقية مرفوضة كما هو متوقع (forbidden). لا توجد ثغرات.'
        }, { quoted: msg });
      }

      return sock.sendMessage(chatId, {
        text: `❌ فشل الفحص: ${err.message}`
      }, { quoted: msg });
    }
  }
};
