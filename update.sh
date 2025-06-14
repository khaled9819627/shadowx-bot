#!/data/data/com.termux/files/usr/bin/bash

echo "🔄 جاري التحديث من GitHub..."

git fetch --all
git reset --hard origin/main

echo "📦 تثبيت الحزم..."
npm install --legacy-peer-deps

echo "✅ تم التحديث بنجاح! ..."
