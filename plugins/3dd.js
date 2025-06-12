const fs = require('fs');
const path = require('path');
const { getUniqueKicked } = require('../haykala/dataUtils');

const dataFilePath = path.join(__dirname, '..', 'data', 'usersData.json');

function readData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify({ kickedCount: 0 }, null, 2));
      return { kickedCount: 0 };
    }
    const raw = fs.readFileSync(dataFilePath);
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading data file:', e);
    return { kickedCount: 0 };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing data file:', e);
  }
}

module.exports = {
  command: 'عدد',
  description: 'يعرض عدد الأعضاء الذين تم طردهم ومستوى التصفية',
  category: 'زرف',
  usage: '.عدد',

  async execute(sock, msg) {
    // اقرأ البيانات المخزنة
    const data = readData();

    // احصل على عدد الـ kicked من الدالة (لو تريد تحديث العدد هنا من getUniqueKicked)
    const kickedSet = getUniqueKicked();
    const totalFromLive = kickedSet.size;

    // إذا كان العدد الحالي أكبر من المخزن حدث البيانات
    if (totalFromLive > data.kickedCount) {
      data.kickedCount = totalFromLive;
      writeData(data);
    }

    const total = data.kickedCount;

    // تحديد المستويات والرموز التعبيرية
    const levels = [
      { threshold: 0, emoji: '🔻' },
      { threshold: 50, emoji: '🔵' },
      { threshold: 100, emoji: '🟠' },
      { threshold: 200, emoji: '🟢' },
      { threshold: 400, emoji: '💲' },
      { threshold: 800, emoji: '🟣' },
      { threshold: 1600, emoji: '🟤' },
      { threshold: 3200, emoji: '🔴' },
      { threshold: 6400, emoji: '⚫' },
      { threshold: 12800, emoji: '⚪' },
      { threshold: 25600, emoji: '🔆' },
      { threshold: 51200, emoji: '⚜️' },
      { threshold: 102400, emoji: '🔱' },
      { threshold: 204800, emoji: '✴️' },
      { threshold: 409600, emoji: '☢️' },
      { threshold: 819200, emoji: '💠' },
      { threshold: 1638400, emoji: '♾️' }
    ];

    let level = 0;
    let emoji = '🔶';

    for (let i = levels.length - 1; i >= 0; i--) {
      if (total >= levels[i].threshold) {
        level = i;
        emoji = levels[i].emoji;
        break;
      }
    }

    const message = `المستوى : ${level} ${emoji}\nعدد التصفية : ${total} 🔹`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    }, { quoted: msg });
  }
};
