const fs = require('fs');
const path = require('path');

const bannedFile = path.join(__dirname, '../data/banned.json');

function getBannedUsers() {
  if (!fs.existsSync(bannedFile)) return [];
  const data = fs.readFileSync(bannedFile, 'utf8');
  return JSON.parse(data);
}

function saveBannedUsers(users) {
  fs.writeFileSync(bannedFile, JSON.stringify(users, null, 2));
}

module.exports = {
  command: 'بان',
  description: 'حظر مستخدم من استخدام البوت.',
  usage: '.بان [رقم المستخدم]',
  category: 'أمان',

  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const args = body.trim().split(' ').slice(1);

    if (args.length === 0) {
      return await sock.sendMessage(from, { text: '❗ الرجاء كتابة رقم المستخدم بعد الأمر.' }, { quoted: msg });
    }

    const userToBan = args[0].includes('@s.whatsapp.net') ? args[0] : `${args[0]}@s.whatsapp.net`;

    let bannedUsers = getBannedUsers();

    if (bannedUsers.includes(userToBan)) {
      return await sock.sendMessage(from, { text: '❗ المستخدم محظور بالفعل.' }, { quoted: msg });
    }

    bannedUsers.push(userToBan);
    saveBannedUsers(bannedUsers);

    await sock.sendMessage(from, { text: `✅ تم حظر المستخدم ${args[0]} من استخدام البوت.` }, { quoted: msg });
  }
};
