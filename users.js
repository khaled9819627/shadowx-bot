const fs = require('fs-extra');
const path = require('path');

const usersDir = path.join(__dirname, 'database', 'users');

async function ensureUserFile(userId) {
    const userFile = path.join(usersDir, `${userId}.json`);
    if (!await fs.pathExists(userFile)) {
        await fs.outputJson(userFile, {}); // إذا ما كان موجود، ننشئ ملف فارغ
    }
    return userFile;
}

async function getUserData(userId) {
    const userFile = await ensureUserFile(userId);
    return await fs.readJson(userFile);
}

async function saveUserData(userId, data) {
    const userFile = await ensureUserFile(userId);
    await fs.writeJson(userFile, data, { spaces: 2 });
}

module.exports = {
    getUserData,
    saveUserData
};
