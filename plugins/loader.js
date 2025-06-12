const fs = require('fs-extra');
const path = require('path');

module.exports = async function loadUserPlugins(userId) {
    const basePluginDir = path.join(__dirname); // مجلد plugins
    const userPluginDir = path.join(__dirname, '..', 'users', userId, 'plugins');

    // إذا مجلد أوامر المستخدم مش موجود، انسخ له نسخة من الأساسية
    if (!(await fs.pathExists(userPluginDir))) {
        await fs.ensureDir(userPluginDir);
        await fs.copy(basePluginDir, userPluginDir, {
            filter: (src) => !src.endsWith('loader.js') // لا تنسخ هذا الملف نفسه
        });
    }

    // تحميل أوامر المستخدم من مجلده
    const files = await fs.readdir(userPluginDir);
    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                require(path.join(userPluginDir, file));
            } catch (e) {
                console.error(`[PLUGIN ERROR] ${file}:`, e.message);
            }
        }
    }
};
