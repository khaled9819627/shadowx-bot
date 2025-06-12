// plugins/loader.js
const fs = require('fs');
const path = require('path');
const { getUserPluginPath } = require('../users');

module.exports = async function loadUserPlugins(userId = null) {
    const pluginPath = userId ? getUserPluginPath(userId) : path.join(__dirname);

    const pluginFiles = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));

    for (const file of pluginFiles) {
        try {
            require(path.join(pluginPath, file));
            console.log(`✔ تم تحميل الأمر: ${file}`);
        } catch (err) {
            console.error(`✖ فشل تحميل الأمر ${file}:`, err.message);
        }
    }
};
