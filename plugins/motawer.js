module.exports = {
  command: 'المطور',
  description: 'يعرض معلومات مطور البوت',
  category: 'info',
  usage: '.المطور',

  async execute(sock, msg) {
    const message = `
╭── ⌯ معلومات المطور ⌯ ──╮
│ 👑 الاسم : خالد
│ 🔗 GitHub : khaled9819627
│ 📞 واتساب : +963968552137
│ 🤖 البوت : SHADOWX BOT
╰──────────────────────╯
`.trim();

    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    }, { quoted: msg });
  }
};
