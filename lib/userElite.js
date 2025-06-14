const fs = require('fs');
const path = require('path');

const getEliteFilePath = (userId) => {
  const cleanId = userId.split('@')[0];
  const dir = path.join(__dirname, '../users', cleanId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'elite.json');
};

const loadElite = (userId) => {
  const filePath = getEliteFilePath(userId);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(filePath));
};

const saveElite = (userId, data) => {
  const filePath = getEliteFilePath(userId);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = { loadElite, saveElite };
