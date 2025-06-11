module.exports = {
    command: 'حجرة',
    description: 'العب حجر ورقة مقص مع البوت',
    category: 'ألعاب',
    usage: '.حجرة حجرة | ورقة | مقص',

    async execute(sock, msg) {
        const userInput = msg.message?.conversation?.split(' ')[1]?.toLowerCase();

        if (!userInput || !['حجرة', 'ورقة', 'مقص'].includes(userInput)) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '🪨 اكتب: .حجرة حجرة أو .حجرة ورقة أو .حجرة مقص'
            }, { quoted: msg });
        }

        const options = ['حجرة', 'ورقة', 'مقص'];
        const botChoice = options[Math.floor(Math.random() * options.length)];

        let result = 'تعادل! 😐';
        if (
            (userInput === 'حجرة' && botChoice === 'مقص') ||
            (userInput === 'مقص' && botChoice === 'ورقة') ||
            (userInput === 'ورقة' && botChoice === 'حجرة')
        ) {
            result = 'أنت فزت! 🎉';
        } else if (userInput !== botChoice) {
            result = 'أنا فزت! 😎';
        }

        await sock.sendMessage(msg.key.remoteJid, {
            text: `🧠 أنت اخترت: ${userInput}\n🤖 أنا اخترت: ${botChoice}\n\n🎮 النتيجة: ${result}`
        }, { quoted: msg });
    }
};