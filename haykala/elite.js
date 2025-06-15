// elite.js
const fs = require('fs');
const path = require('path');
const config = require('../config');

function getEliteFilePath(ownerNumber) {
  const dir = path.join(__dirname, '..', 'shadowx_data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = `elite_${ownerNumber.replace(/[@+]/g, '')}.json`;
  return path.join(dir, file);
}

function loadEliteList(ownerNumber) {
  const filePath = getEliteFilePath(ownerNumber);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}

function saveEliteList(ownerNumber, list) {
  const filePath = getEliteFilePath(ownerNumber);
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
}

function isElite(userNumber, ownerNumber) {
  try {
    if (config.owners.includes(userNumber)) return true;

    const list = loadEliteList(ownerNumber);
    return list.includes(userNumber);
  } catch {
    return false;
  }
}

function addEliteNumber(ownerNumber, newNumber) {
  try {
    const list = loadEliteList(ownerNumber);
    if (list.includes(newNumber)) return false;
    list.push(newNumber);
    saveEliteList(ownerNumber, list);
    return true;
  } catch (e) {
    console.error('Error adding elite number:', e);
    return false;
  }
}

function removeEliteNumber(ownerNumber, numberToRemove) {
  try {
    let list = loadEliteList(ownerNumber);
    if (!list.includes(numberToRemove)) return false;
    list = list.filter(n => n !== numberToRemove);
    saveEliteList(ownerNumber, list);
    return true;
  } catch (e) {
    console.error('Error removing elite number:', e);
    return false;
  }
}

function getEliteList(ownerNumber) {
  return loadEliteList(ownerNumber);
}

module.exports = {
  isElite,
  addEliteNumber,
  removeEliteNumber,
  getEliteList,
};
