(function () { const fs = require('fs-extra'); const pino = require('pino'); const path = require('path'); const chalk = require('chalk'); const readline = require('readline'); const { exec } = require('child_process'); const logger = require('./utils/console'); const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

const playSound = (file) => {
    try {
        const control = path.join(__dirname, 'sounds', 'sound.txt');
        if (fs.existsSync(control) && fs.readFileSync(control, 'utf-8').trim() === '{on}') {
            const audio = path.join(__dirname, 'sounds', file);
            if (fs.existsSync(audio)) exec(`mpv --no-terminal --really-quiet "${audio}"`);
        }
    } catch {}
};

const question = (txt) => new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(txt, ans => { rl.close(); res(ans); });
});

const startBot = async () => {
    try {
        console.clear();
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
            for (const g of groups) {
                try { await sock.groupMetadata(g.id); } catch {}
            }
        });

        if (!sock.authState.creds.registered) {
            console.log(chalk.bold('\n[ SETUP ] Enter your number for pairing code:'));
            let num = await question(chalk.bgHex('#FFD700').black(' Phone Number : '));
            if (num.trim() === '#') process.exit();
            num = num.replace(/\D/g, '');
            if (!num.match(/^\d{10,15}$/)) return console.log("\n[ ERROR ] Invalid number.");
            try {
                const code = await sock.requestPairingCode(num);
                console.log(`\nPairing Code: ${code}\nPhone Number: ${num}\n`);
            } catch {
                console.log("\n[ ERROR ] Failed to get pairing code.");
                return process.exit(1);
            }
        }

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'connecting') return logger.info('Connecting...');
            if (connection === 'open') {
                logger.success(`CONNECTED! ID: ${sock.user.id}`);
                try {
                    const { addEliteNumber } = require('./haykala/elite');
                    const botNum = sock.user.id.split(':')[0].replace(/\D/g, '');
                    await addEliteNumber(botNum);
                    logger.info(`ADDED ${botNum} AS ELITE!`);
                } catch (e) {
                    logger.error('Failed to add elite:', e.message);
                }
                require('./handlers/handler').handleMessagesLoader();
                listenToConsole();
            }
            if (connection === 'close') {
                const logout = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
                logger.warn(`Disconnected: ${lastDisconnect?.error?.message || 'Unknown reason'}`);
                if (logout) return process.exit(1);
                logger.info('Reconnecting...');
                setTimeout(startBot, 3000);
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            try {
                const { handleMessages } = require('./handlers/handler');
                await handleMessages(sock, m);
            } catch (e) {
                logger.error('Error handling message:', e);
                playSound('ERROR.mp3');
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (err) {
        logger.error('Startup error:', err);
        playSound('ERROR.mp3');
        setTimeout(startBot, 3000);
    }
};

const listenToConsole = () => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.on('line', () => console.log('[ CMD ] Unknown command.'));
};

startBot();

})();

