const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const baseDir = path.join(__dirname, 'users'); // مجلد المستخدمين
  if (!fs.existsSync(baseDir)) return;

  const users = fs.readdirSync(baseDir); // جلب أسماء المجلدات (المستخدمين)

  for (const user of users) {
    const userDir = path.join(baseDir, user);

    if (!fs.statSync(userDir).isDirectory()) continue;

    // قراءة ملفات js داخل مجلد المستخدم
    const files = fs.readdirSync(userDir).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(userDir, file);
      try {
        const plugin = require(filePath);
        if (plugin?.command) {
          global.plugins.push(plugin); // إضافة الأمر لقائمة أوامر البوت
          console.log(`✅ Loaded user command: ${plugin.command} (${user})`);
        }
      } catch (err) {
        console.error(`❌ Failed to load ${file}:`, err);
      }
    }
  }
};
