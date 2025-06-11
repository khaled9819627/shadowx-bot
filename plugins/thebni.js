module.exports = {
    command: 'تحبني',
    description: 'يسألك البوت إذا يحبك ',
    category: 'تفاعل',

    async execute(sock, msg) {
        const replies = [
            'أكيد بحبك يا زلمة ❤️',
            'يعني شوي ',
            'لا تسألني هالأسئلة المحرجة ',
            'أكتر من أي حدا بهالعالم 🫦',
            'لا 😐',
            'حبك بالقلب مو بالكلام 💘'
        ];

        const random = replies[Math.floor(Math.random() * replies.length)];

        await sock.sendMessage(msg.key.remoteJid, {
            text: random
        }, { quoted: msg });
    }
};