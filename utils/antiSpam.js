const cooldowns = new Map();

function isSpamming(sender, limitMs = 3000) {
    const now = Date.now();
    if (cooldowns.has(sender)) {
        const lastTime = cooldowns.get(sender);
        if (now - lastTime < limitMs) {
            return true; // المستخدم سبام
        }
    }
    cooldowns.set(sender, now);
    return false;
}

module.exports = { isSpamming };
