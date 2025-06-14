/**
 * loader.js
 * أمر بسيط يرسل رسالة تأكيد عند استدعائه
 */

const loaderCommand = {
  command: 'loader',               // اسم الأمر
  description: 'مثال أمر بسيط يعمل اختبار للتحميل',
  category: 'أوامر عامة',

  async execute(sock, msg) {
    try {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: '✅ أمر loader يعمل بنجاح!' },
        { quoted: msg }
      );
    } catch (error) {
      console.error('حدث خطأ أثناء تنفيذ أمر loader:', error);
    }
  }
};

module.exports = loaderCommand;
