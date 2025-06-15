const fs = require('fs');
const path = require('path');

function getEliteFilePath(ownerNumber) {
  const dir = path.join(__dirname, '..', 'shadowx_data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = `elite_${ownerNumber.replace(/[@+]/g, '')}.json`;
  return path.join(dir, file);
}

function isElite(userNumber, ownerNumber) {
  try {
    // المطور يعتبر نخبة دائمًا
    const config = require('../config');
    if (config.owners.includes(userNumber)) return true;

    const filePath = getEliteFilePath(ownerNumber);
    if (!fs.existsSync(filePath)) return false;

    const list = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return list.includes(userNumber);
  } catch {
    return false;
  }
}

module.exports = {
  isElite
};
