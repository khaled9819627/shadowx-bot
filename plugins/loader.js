const fs = require('fs');
const path = require('path');

module.exports = async function loadUserPlugins(userId) {
    const defaultPluginsDir = path.join(__dirname);
    const userPluginsDir = path.join(__dirname, '../users', userId, 'plugins');

    // إذا ما كان عنده مجلد خاص، انسخ له النسخة الأولى
    if (!fs.existsSync(userPluginsDir)) {
        fs.mkdirSync(userPluginsDir, { recursive: true });
        const defaultFiles = fs.readdirSync(defaultPluginsDir).filter(file => file.endsWith('.js'));
        for (const file of defaultFiles) {
            fs.copyFileSync(path.join(defaultPluginsDir, file), path.join(userPluginsDir, file));
        }
    }

    // تحميل أوامر المستخدم
    const pluginFiles = fs.readdirSync(userPluginsDir).filter(file => file.endsWith('.js'));
    for (const file of pluginFiles) {
        try {
            require(path.join(userPluginsDir, file));
        } catch (e) {
            console.log(`[PLUGIN ERROR] ${file}:`, e.message);
        }
    }
};
