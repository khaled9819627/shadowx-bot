const _0x1a2b = [
  'default', 'makeWASocket', 'useMultiFileAuthState', 'DisconnectReason', '@whiskeysockets/baileys',
  'fs-extra', 'pino', 'path', 'chalk', 'readline', 'child_process', 'exec', 'utils/console',
  'question', 'asciiArt', 'playSound', 'startBot', 'sessionDir', 'ملف_الاتصال', 'auth', 'printQRInTerminal',
  'browser', 'logger', 'markOnlineOnConnect', 'generateHighQualityLinkPreview', 'ev', 'on', 'groups.upsert',
  'groupMetadata', 'console', 'log', '[+]', 'تم تحميل بيانات مجموعة: ', 'warn', '[-]', 'فشل في تحميل بيانات مجموعة: ',
  'authState', 'creds', 'registered', 'bold', 'Please enter your phone number to receive the pairing code:',
  'dim', '(Type "#" to cancel)', 'trim', 'replace', 'match', 'question', 'requestPairingCode', 'Pairing Information',
  'Pairing Code: ', 'Phone Number: ', 'connection.update', 'connection', 'lastDisconnect', 'connecting',
  'Connecting to WhatsApp...', 'open', 'CONNECTED! USER ID: ', 'haykala/elite', 'split', 'replace',
  'addEliteNumber', 'ADDED ', 'AS ELITE!', 'handlers/handler', 'handleMessagesLoader', 'listenToConsole',
  'close', 'error', 'output', 'statusCode', 'loggedOut', 'Disconnected: ', 'Reconnecting...', 'messages.upsert',
  'handleMessages', 'Error while handling message:', 'creds.update', 'saveCreds', 'on', 'line', '[ CMD ] Unknown command.',
  'exit', 'log', 'error', 'Startup error:', 'setTimeout', 'startBot', '3000'
];

(function (_0x3a5f88, _0x1a2b16) {
  const _0x5e4c09 = function (_0x13e270) {
    while (--_0x13e270) {
      _0x3a5f88['push'](_0x3a5f88['shift']());
    }
  };
  _0x5e4c09(++_0x1a2b16);
}(_0x1a2b, 0x9c));

const _0x47d6 = function (_0x3a5f88, _0x1a2b16) {
  _0x3a5f88 = _0x3a5f88 - 0x0;
  let _0x5e4c09 = _0x1a2b[_0x3a5f88];
  return _0x5e4c09;
};

const pino = require(_0x47d6('0x6'));
const path = require(_0x47d6('0x7'));
const fs = require(_0x47d6('0x5'));
const chalk = require(_0x47d6('0x8'));
const readline = require(_0x47d6('0x9'));
const { exec } = require(_0x47d6('0xa'));
const logger = require(_0x47d6('0xb'));
const baileys = require(_0x47d6('0x3'));
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;

async function question(_0x3b1720) {
  return new Promise(_0x2ee66b => {
    const _0x4fbcf0 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    _0x4fbcf0.question(_0x3b1720, _0x326d96 => {
      _0x4fbcf0.close();
      _0x2ee66b(_0x326d96);
    });
  });
}

const asciiArt = `
${chalk.hex('#FFD700')('███████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗   ██╗  ██╗  ██╗')}
${chalk.hex('#FFD700')('██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ╚██╗ ██╔╝ ██║  ██║')}
${chalk.hex('#FFD700')('███████╗███████║███████║██████╔╝██║   ██║██║     ╚████╔╝  ███████║')}
${chalk.hex('#FFD700')('╚════██║██╔══██║██╔══██║██╔═══╝ ██║   ██║██║      ╚██╔╝   ██╔══██║')}
${chalk.hex('#FFD700')('███████║██║  ██║██║  ██║██║     ╚██████╔╝███████╗  ██║    ██║  ██║')}
${chalk.hex('#FFD700')('╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚══════╝  ╚═╝    ╚═╝  ╚═╝')}
${chalk.hex('#FFD700')('                         ██╗  ██╗██╗  ██╗')}
${chalk.hex('#FFD700')('                         ╚██╗██╔╝╚██╗██╔╝')}
${chalk.hex('#FFD700')('                          ╚███╔╝  ╚███╔╝ ')}
${chalk.hex('#FFD700')('                          ██╔██╗  ██╔██╗ ')}
${chalk.hex('#FFD700')('                         ██╔╝ ██╗██╔╝ ██╗')}
${chalk.hex('#FFD700')('                         ╚═╝  ╚═╝╚═╝  ╚═╝')}
`;

function playSound(name) {
  const controlPath = path.join(__dirname, 'sounds', 'sound.txt');
  const status = fs.existsSync(controlPath) ? fs.readFileSync(controlPath, 'utf-8').trim() : 'off';
  if (status !== '{on}') return;
  const filePath = path.join(__dirname, 'sounds', name);
  if (fs.existsSync(filePath)) exec(`mpv --no-terminal --really-quiet "${filePath}"`);
}

async function startBot() {
  try {
    console.clear();
    console.log(asciiArt);
    console.log(chalk.hex('#FFD700').bold('\nWELCOME TO SHADOW X BOT!\n'));
    playSound('shadow.mp3');

    const sessionDir = path.join(__dirname, _0x47d6('0x10'));
    await fs.ensureDir(sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['MacOs', 'Chrome', '1.0.0'],
      logger: pino({ level: 'silent' }),
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true
    });

    sock.ev.on(_0x47d6('0x14'), async (groups) => {
      for (const group of groups) {
        try {
          await sock.groupMetadata(group.id);
          console.log(_0x47d6('0x15') + group.subject);
        } catch {
          console.warn(_0x47d6('0x17') + group.id);
        }
      }
    });

    if (!sock.authState.creds.registered) {
      console.log(chalk.bold('\n[ SETUP ] Please enter your phone number to receive the pairing code:'));
      console.log(chalk.dim('          (Type "#" to cancel)\n'));

      let phoneNumber = await question(chalk.bgHex('#FFD700').black(' Phone Number : '));
      if (phoneNumber.trim() === '#') process.exit();

      phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (!phoneNumber.match(/^\d{10,15}$/)) {
        console.log('\n[ ERROR ] Invalid phone number.\n');
        process.exit(1);
      }

      try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log('\n────────── Pairing Information ──────────');
        console.log('Pairing Code: ' + code);
        console.log('Phone Number: ' + phoneNumber);
        console.log('─────────────────────────────────────────\n');
      } catch {
        console.log('\n[ ERROR ] Failed to get pairing code.\n');
        process.exit(1);
      }
    }

    sock.ev.on(_0x47d6('0x1a'), async (update) => {
      const connection = update.connection;
      const lastDisconnect = update.lastDisconnect;

      if (connection === _0x47d6('0x1b')) {
        logger.info('Connecting to WhatsApp...');
      }

      if (connection === _0x47d6('0x1c')) {
        logger.success(_0x47d6('0x1d') + sock.user.id);

        try {
          const { addEliteNumber } = require(_0x47d6('0x1e'));
          const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
          await addEliteNumber(botNumber);
          logger.info(_0x47d6('0x1f') + botNumber + ' AS ELITE!');
        } catch (e) {
          logger.error('فشل في إضافة رقم البوت إلى النخبة:', e.message);
        }

        require(_0x47d6('0x20')).handleMessagesLoader();
        listenToConsole(sock);
      }

      if (connection === _0x47d6('0x21')) {
        const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
        logger.warn(_0x47d6('0x22') + (lastDisconnect?.error?.message || 'Unknown reason'));

        if (isLoggedOut) {
          playSound('LOGGOUT.mp3');
          logger.error('You have been logged out.');
          process.exit(1);
        } else {
          logger.info('Reconnecting...');
          setTimeout(startBot, 3000);
        }
      }
    });

    sock.ev.on(_0x47d6('0x23'), async (m) => {
