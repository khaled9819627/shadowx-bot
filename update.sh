#!/data/data/com.termux/files/usr/bin/bash

echo "🔄 جاري التحديث من GitHub..."

git fetch --all
git reset --hard origin/main

echo "📦 تثبيت الحزم..."
npm install

echo "✅ تم التحديث بنجاح! جارٍ تشغيل البوت..."
chmod +x start.sh
./start.sh
