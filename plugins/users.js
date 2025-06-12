// users.js
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  getUserPluginPath: function (userId) {
    const userPluginsPath = path.join(__dirname, 'users', userId, 'plugins');
    const defaultPluginsPath = path.join(__dirname, 'plugins');

    // انسخ الأوامر الافتراضية إن لم تكن موجودة
    if (!fs.existsSync(userPluginsPath)) {
      fs.ensureDirSync(userPluginsPath);
      fs.copySync(defaultPluginsPath, userPluginsPath);
    }

    return userPluginsPath;
  }
};
