module.exports = {
    command: 'نصيحة',
    description: 'يعطيك نصيحة عشوائية',
    category: 'تفاعل',

    async execute(sock, msg) {
        const tips = [
            'نام بكير واصحى بكير بتلاقي الدنيا غير.',
            'طنّش تعِش تنقهر الناس 😌',
            'كل يوم أضحك، حتى لو ما في شي يضحك.',
            'لا تعلق قلبك بحدا، علّقه بالله ❤️',
            'رتّب غرفتك... يمكن ترتاح نفسياً.',
            'ما في حدا كامل، تقبّل العيوب ✌️'
        ];

        const random = tips[Math.floor(Math.random() * tips.length)];

        await sock.sendMessage(msg.key.remoteJid, {
            text: `💡 نصيحة اليوم:\n\n${random}`
        }, { quoted: msg });
    }
};