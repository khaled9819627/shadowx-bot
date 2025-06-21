const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const pino = require('pino');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { exec } = require('child_process');
const logger = require('./utils/console');

const question = (text) => new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
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
    if (status !== 'on') return; // تم تعديل الشرط ليقارن بـ 'on' وليس '{on}'

    const filePath = path.join(__dirname, 'sounds', name);
    if (fs.existsSync(filePath)) {
        // استخدم exec مع اقتباسات صحيحة
        exec(`mpv --no-terminal --really-quiet "${filePath}"`, (error) => {
            if (error) {
                logger.error(`Failed to play sound ${name}: ${error.message}`);
            }
        });
    }
}

async function startBot() {
    try {
        console.clear();
        console.log(asciiArt);
        console.log(chalk.hex('#FFD700').bold('\nWELCOME TO SHADOW X BOT!\n'));

        playSound('shadow.mp3');

        const sessionDir = path.join(__dirname, 'ملف_الاتصال');
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

        sock.ev.on('groups.upsert', async (groups) => {
            for (const group of groups) {
                try {
                    await sock.groupMetadata(group.id);
                    console.log(`[+] تم تحميل بيانات مجموعة: ${group.subject}`);
                } catch (err) {
                    console.warn(`[-] فشل في تحميل بيانات مجموعة: ${group.id}`);
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
                console.log("\n[ ERROR ] Invalid phone number.\n");
                process.exit(1);
            }

            try {
                // في نسخة Baileys الحالية لا يوجد دالة requestPairingCode مباشرة
                // يمكنك هنا تنفيذ طريقة تسجيل الدخول عبر QR أو غيرها حسب التوثيق
                console.log('[ INFO ] Please scan the QR code to authenticate.');
                // بدلاً من requestPairingCode، يمكنك عرض QR في الطرفية إذا printQRInTerminal = true
                // أو استخدام مكتبة خارجية لعرض QR
            } catch (error) {
                console.log("\n[ ERROR ] Failed to get pairing code.\n");
                process.exit(1);
            }
        }

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                // عرض QR في الطرفية
                const qrcode = require('qrcode-terminal');
                qrcode.generate(qr, { small: true });
                logger.info('Please scan the QR code above with your WhatsApp.');
            }

            if (connection === 'connecting') {
                logger.info('Connecting to WhatsApp...');
            }

            if (connection === 'open') {
                logger.success(`CONNECTED! USER ID: ${sock.user.id}`);

                try {
                    const { addEliteNumber } = require('./haykala/elite');
                    const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
                    await addEliteNumber(botNumber);
                    logger.info(`ADDED ${botNumber} AS ELITE!`);
                } catch (e) {
                    logger.error('فشل في إضافة رقم البوت إلى النخبة:', e.message);
                }

                require('./handlers/handler').handleMessagesLoader();
                listenToConsole(sock);
            }

            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode || DisconnectReason.unknown;
                const message = lastDisconnect?.error?.message || 'Unknown reason';

                if (message.includes('Bad MAC')) {
                    logger.warn('⚠ Bad MAC error ignored.');
                    return;
                }

                logger.warn(`Disconnected: ${message}`);

                if (reason === DisconnectReason.loggedOut) {
                    playSound('LOGGOUT.mp3');
                    logger.error('You have been logged out.');
                    process.exit(1);
                } else {
                    logger.info('Reconnecting...');
                    setTimeout(startBot, 3000);
                }
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            try {
                const { handleMessages } = require('./handlers/handler');
                await handleMessages(sock, m);
            } catch (err) {
                if (err.message?.includes('Bad MAC')) {
                    logger.warn('❌ Bad MAC detected while handling message. Skipped.');
                    return;
                }
                logger.error('Error while handling message:', err);
                playSound('ERROR.mp3');
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (err) {
        if (err.message?.includes('Bad MAC')) {
            logger.warn('❌ Bad MAC detected on startup. Ignored.');
            return;
        }
        logger.error('Startup error:', err);
        playSound('ERROR.mp3');
        setTimeout(startBot, 3000);
    }
}

function listenToConsole(sock) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.on('line', (line) => {
        console.log('[ CMD ] Unknown command.');
    });
}

startBot();
