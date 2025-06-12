const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'database', 'users.json');

// تأكد أن الملف موجود
if (!fs.existsSync(USERS_FILE)) {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

let users = JSON.parse(fs.readFileSync(USERS_FILE));

// حفظ التغييرات
function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// البحث عن مستخدم
function findUser(id) {
    return users.find(user => user.id === id);
}

// إضافة مستخدم
function addUser(id, name = '', role = 'member') {
    if (!findUser(id)) {
        users.push({ id, name, role });
        saveUsers();
    }
}

// إزالة مستخدم
function removeUser(id) {
    users = users.filter(user => user.id !== id);
    saveUsers();
}

// تحديث معلومات مستخدم
function updateUser(id, data) {
    const user = findUser(id);
    if (user) {
        Object.assign(user, data);
        saveUsers();
    }
}

module.exports = {
    users,
    addUser,
    findUser,
    removeUser,
    updateUser
};
