const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const pino = require('pino');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { exec } = require('child_process');
const logger = require('./utils/console');

const question = text => new Promise(resolve => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(text, answer => {
        rl.close();
        resolve(answer);
    });
});

const asciiArt = `
${chalk.hex('#FFD700')('███████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗   ██╗  ██╗  ██╗')}
${chalk.hex('#FFD700')('██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ╚██╗ ██╔╝ ██║  ██║')}
${chalk.hex('#FFD700')('███████╗███████║███████║██████╔╝██║   ██║██║     ╚████╔╝  ███████║')}
${chalk.hex('#FFD700')('╚════██║██╔══██║██╔══██║██╔═══╝ ██║   ██║██║      ╚██╔╝   ██╔══██║')}
${chalk.hex('#FFD700')('███████║██║  ██║██║  ██║██║     ╚██████╔╝███████╗  ██║    ██║  ██║')}
${chalk.hex('#FFD700')('╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚══════╝  ╚═╝    ╚═╝  ╚═╝')}
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

        // استخدام اسم مجلد اتصال خاص لكل مستخدم بناءً على الرقم
        const userId = process.env.USER_PHONE || 'default';
        const sessionDir = path.join(__dirname, 'ملفات_الاتصال', userId);
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

        if (!sock.authState.creds.registered) {
            console.log(chalk.bold('\n[ SETUP ] أدخل رقمك لاستلام كود الاقتران:'));
            let phoneNumber = await question(chalk.bgHex('#FFD700').black(' رقم الهاتف: '));
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            if (!phoneNumber.match(/^\d{10,15}$/)) {
                console.log("\n[ ERROR ] رقم غير صالح.\n");
                process.exit(1);
            }
            const code = await sock.requestPairingCode(phoneNumber);
            console.log(`\nكود الاقتران: ${code}\n`);
        }

        sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
            if (connection === 'connecting') logger.info('جاري الاتصال...');
            if (connection === 'open') {
                logger.success(`تم الاتصال: ${sock.user.id}`);
                try {
                    const { addEliteNumber } = require('./haykala/elite');
                    const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
                    await addEliteNumber(botNumber);
                } catch (e) {}
                require('./handlers/handler').handleMessagesLoader();
                listenToConsole(sock);
            }
            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                if (code === DisconnectReason.loggedOut) {
                    logger.error('تم تسجيل الخروج.');
                    playSound('LOGGOUT.mp3');
                    process.exit(1);
                } else {
                    logger.warn('إعادة الاتصال بعد فشل.');
                    setTimeout(startBot, 3000);
                }
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            try {
                const { handleMessages } = require('./handlers/handler');
                await handleMessages(sock, m);
            } catch (err) {
                logger.error('خطأ أثناء المعالجة:', err);
                playSound('ERROR.mp3');
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (err) {
        logger.error('Startup error:', err);
        playSound('ERROR.mp3');
        setTimeout(startBot, 3000);
    }
}

function listenToConsole(sock) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', () => {
        console.log('[ CMD ] الأمر غير معروف.');
    });
}

startBot();
