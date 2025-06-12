const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'usersData.json');

function readUsersData() {
  if (!fs.existsSync(dataFilePath)) return {};
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeUsersData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

module.exports = {
  command: 'user',
  description: 'أمر مثال للتعامل مع بيانات المستخدمين',
  category: 'أدوات',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;

    // قراءة بيانات المستخدمين من الملف الخارجي
    let users = readUsersData();

    // لو ما في بيانات للمحادثة
    if (!users[chatId]) {
      users[chatId] = {
        count: 0,
        // أي بيانات تحب تحفظها
      };
    }

    // مثال تعديل بيانات
    users[chatId].count++;

    // حفظ البيانات مجددًا
    writeUsersData(users);

    // إرسال رد للمستخدم مع عدد التفاعل
    await sock.sendMessage(chatId, { text: `تم التفاعل ${users[chatId].count} مرة.` }, { quoted: msg });
  }
};
