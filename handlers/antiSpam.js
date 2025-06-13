const spamMap = new Map();

const LIMIT = 5; // عدد الأوامر المسموحة
const INTERVAL = 3000; // خلال كم ميلي ثانية (3 ثواني)
const BLOCK_DURATION = 10000; // مدة الحظر المؤقت (10 ثواني)

function isSpamming(userId) {
  const now = Date.now();

  if (!spamMap.has(userId)) {
    spamMap.set(userId, { count: 1, last: now, blockedUntil: 0 });
    return false;
  }

  const user = spamMap.get(userId);

  // إذا لسه محظور مؤقتًا
  if (now < user.blockedUntil) return true;

  // إعادة العد إذا انتهت المدة
  if (now - user.last > INTERVAL) {
    user.count = 1;
    user.last = now;
    spamMap.set(userId, user);
    return false;
  }

  // زيادة العد
  user.count++;
  user.last = now;

  if (user.count > LIMIT) {
    user.blockedUntil = now + BLOCK_DURATION;
    spamMap.set(userId, user);
    return true;
  }

  spamMap.set(userId, user);
  return false;
}

module.exports = { isSpamming };
