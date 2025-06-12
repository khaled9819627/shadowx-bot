const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'data', 'users.json');

function loadUsers() {
  if (!fs.existsSync(usersFile)) return {};
  const data = fs.readFileSync(usersFile, 'utf8');
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

module.exports = {
  loadUsers,
  saveUsers
};
