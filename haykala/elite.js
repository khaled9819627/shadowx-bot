const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'user_elite');

function getFilePath(number) {
    return path.join(basePath, `${number}.json`);
}

function loadEliteNumbers(userNumber) {
    const filePath = getFilePath(userNumber);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath));
}

function saveEliteNumbers(userNumber, numbers) {
    const filePath = getFilePath(userNumber);
    fs.writeFileSync(filePath, JSON.stringify(numbers, null, 2));
}

function addEliteNumber(userNumber, numberToAdd) {
    const list = loadEliteNumbers(userNumber);
    if (!list.includes(numberToAdd)) {
        list.push(numberToAdd);
        saveEliteNumbers(userNumber, list);
    }
}

function removeEliteNumber(userNumber, numberToRemove) {
    const list = loadEliteNumbers(userNumber).filter(n => n !== numberToRemove);
    saveEliteNumbers(userNumber, list);
}

function extractPureNumber(input) {
    return input.replace(/\D/g, '').replace(/^0+/, '');
}

module.exports = {
    loadEliteNumbers,
    addEliteNumber,
    removeEliteNumber,
    extractPureNumber
};
