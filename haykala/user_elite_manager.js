const fs = require('fs');
const path = require('path');

const dataFolder = path.join(__dirname, 'user_elite');

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

function getUserFilePath(number) {
    return path.join(dataFolder, `${number}.json`);
}

function loadEliteList(number) {
    const file = getUserFilePath(number);
    if (!fs.existsSync(file)) return [];
    try {
        return JSON.parse(fs.readFileSync(file));
    } catch {
        return [];
    }
}

function saveEliteList(number, list) {
    const file = getUserFilePath(number);
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
}

function isElite(userNumber, targetNumber) {
    const list = loadEliteList(userNumber);
    return list.includes(targetNumber);
}

function addEliteNumber(userNumber, targetNumber) {
    const list = loadEliteList(userNumber);
    if (!list.includes(targetNumber)) {
        list.push(targetNumber);
        saveEliteList(userNumber, list);
    }
}

function removeEliteNumber(userNumber, targetNumber) {
    const list = loadEliteList(userNumber).filter(n => n !== targetNumber);
    saveEliteList(userNumber, list);
}

function getEliteList(userNumber) {
    return loadEliteList(userNumber);
}

module.exports = {
    isElite,
    addEliteNumber,
    removeEliteNumber,
    getEliteList
};
