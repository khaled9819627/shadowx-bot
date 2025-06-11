module.exports = {
  name: "مطور",
  description: "يعرض معلومات المطور",
  command: ["مطور", "المطور", "owner"],
  type: "whatsapp",

  onCommand: async ({ msg, send }) => {
    await send(msg.chat, `
👑 مطور البوت:
• الاسم: 𝐒𝐇𝐀𝐃𝐎𝐖 𝐗
• الرقم: wa.me/963968552137
• GitHub: github.com/khaled9819627
    `);
  }
};
