import fs from 'fs';
import path from 'path';

export let eliteNumbers = [
  '963968552137',
  '20930080317677',
  '255753021563050',
  '58313324675215',
  '231374636195849',
  '254176181358625',
  '240707533041851'
];

export const extractPureNumber = (jid) => {
  return jid.toString().replace(/[@:].*/g, '');
};

export const isElite = (number) => {
  if (!number) return false;
  const pureNumber = extractPureNumber(number);
  const isMatch = eliteNumbers.includes(pureNumber);
  console.log(`Elite check: ${number} -> ${pureNumber} -> ${isMatch}`);
  return isMatch;
};

export const updateEliteNumbers = () => {
  const elitePath = path.join(process.cwd(), 'haykala', 'elite.js');
  const numbersStr = eliteNumbers.map(num => `'${num}'`).join(',\n  ');
  const newContent = `import fs from 'fs';\nimport path from 'path';\n\nexport let eliteNumbers = [\n  ${numbersStr}\n];\n\nexport const extractPureNumber = (jid) => {\n  return jid.toString().replace(/[@:].*/g, '');\n};\n\nexport const isElite = (number) => {\n  if (!number) return false;\n  const pureNumber = extractPureNumber(number);\n  const isMatch = eliteNumbers.includes(pureNumber);\n  console.log(\`Elite check: \${number} -> \${pureNumber} -> \${isMatch}\`);\n  return isMatch;\n};\n\nexport const updateEliteNumbers = ${updateEliteNumbers.toString()};\n\nexport const addEliteNumber = ${addEliteNumber.toString()};\n\nexport const removeEliteNumber = ${removeEliteNumber.toString()};\n`;

  fs.writeFileSync(elitePath, newContent);
  console.log('✅ تم تحديث قائمة النخبة تلقائيًا.');
};

export const addEliteNumber = (number) => {
  if (!eliteNumbers.includes(number)) {
    eliteNumbers.push(number);
    updateEliteNumbers();
  }
};

export const removeEliteNumber = (number) => {
  const index = eliteNumbers.indexOf(number);
  if (index > -1) {
    eliteNumbers.splice(index, 1);
    updateEliteNumbers();
  }
};
