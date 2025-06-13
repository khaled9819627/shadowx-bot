const fs = require('fs');
const path = require('path');

const bannedFile = path.join(__dirname, 'banned.json');

function getBannedUsers() {
  try {
    const data = fs.readFileSync(bannedFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveBannedUsers(list) {
  fs.writeFileSync(bannedFile, JSON.stringify(list, null, 2));
}

function isUserBanned(userId) {
  const banned = getBannedUsers();
  return banned.includes(userId);
}

function banUser(userId) {
  const banned = getBannedUsers();
  if (!banned.includes(userId)) {
    banned.push(userId);
    saveBannedUsers(banned);
  }
}

function unbanUser(userId) {
  let banned = getBannedUsers();
  banned = banned.filter(id => id !== userId);
  saveBannedUsers(banned);
}

module.exports = { isUserBanned, banUser, unbanUser };
