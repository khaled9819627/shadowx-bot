const fs = require('fs');
const path = require('path');

// الأمر loader
const loaderCommand = {
  command: 'loader',
  description: 'مثال للأمر',
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'الأمر شغال' }, { quoted: msg });
  }
};

// دالة تحميل أوامر المستخدم
async function loadUserPlugins(userId) {
  const defaultPluginsDir = path.join(__dirname);
  const userPluginsDir = path.join(__dirname, '../users', userId, 'plugins');

  // إنشاء مجلد الأوامر الخاص بالمستخدم إذا لم يكن موجودًا
  if (!fs.existsSync(userPluginsDir)) {
    fs.mkdirSync(userPluginsDir, { recursive: true });

    // نسخ ملفات الأوامر الافتراضية إلى مجلد المستخدم
    const defaultFiles = fs.readdirSync(defaultPluginsDir).filter(file => file.endsWith('.js'));
    for (const file of defaultFiles) {
      fs.copyFileSync(path.join(defaultPluginsDir, file), path.join(userPluginsDir, file));
    }
  }

  // قراءة ملفات الأوامر من مجلد المستخدم
  const pluginFiles = fs.readdirSync(userPluginsDir).filter(file => file.endsWith('.js'));
  const loadedCommands = [];

  for (const file of pluginFiles) {
    try {
      const pluginPath = path.join(userPluginsDir, file);
      delete require.cache[require.resolve(pluginPath)]; // إعادة تحميل الأمر إذا تم تغييره
      const plugin = require(pluginPath);

      // لو الأمر صادر كـ object وله خاصيتي command و execute
      if (plugin.command && plugin.execute) {
        loadedCommands.push(plugin);
      }

      // يمكن توسيع هذا الجزء لو كنت تستورد دوال تحميل (loading functions) بدل object
    } catch (e) {
      console.log(`[PLUGIN ERROR] ${file}:`, e.message);
    }
  }

  return loadedCommands; // ترجع مصفوفة الأوامر المحملة
}

module.exports = {
  loaderCommand,
  loadUserPlugins,
};
