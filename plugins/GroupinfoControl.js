const { isElite } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

// تحديد مجلد التخزين (تأكد أنه موجود وقابل للكتابة)
const baseDir = path.join(__dirname, '..', 'storage', 'copy-group');

module.exports = {
    command: 'نسخة',
    description: 'نسخ تفاصيل المجموعة مثل الاسم والوصف والصورة.',
    usage: '.نسخة [نسخ|لصق|حذف|حافظة] [اسم النسخة]',
    category: 'المزيد',
    
    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            const sender = decode(msg.key.participant || groupJid);
            const senderLid = sender.split('@')[0];

            if (!groupJid.endsWith('@g.us')) {
                return await sock.sendMessage(groupJid, {
                    text: '❗ هذا الأمر يعمل فقط داخل المجموعات.'
                }, { quoted: msg });
            }

            if (!isElite(senderLid)) {
                return await sock.sendMessage(groupJid, {
                    text: '❌ ليس لديك صلاحية لاستخدام هذا الأمر.'
                }, { quoted: msg });
            }

            // تأكد أن مجلد التخزين موجود
            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
                console.log('تم إنشاء مجلد التخزين:', baseDir);
            }

            const body = msg.message?.extendedTextMessage?.text ||
                         msg.message?.conversation || '';
            const args = body.trim().split(/\s+/);
            const action = args[1]?.toLowerCase();
            const name = args.slice(2).join(' ').trim();

            if (!action) {
                return await sock.sendMessage(groupJid, {
                    text: '❌ يرجى استخدام الأمر بشكل صحيح:\n.نسخة نسخ [اسم]\n.نسخة لصق [اسم]\n.نسخة حذف [اسم]\n.نسخة حافظة'
                }, { quoted: msg });
            }

            if (action === 'نسخ') {
                if (!name) return await sock.sendMessage(groupJid, { text: '❗ اكتب اسم النسخة\nمثال: .نسخة نسخ مجموعة1' }, { quoted: msg });

                const meta = await sock.groupMetadata(groupJid);
                const groupData = {
                    subject: meta.subject,
                    description: meta.desc || '',
                    settings: {
                        announce: !!meta.announce,
                        restrict: !!meta.restrict
                    },
                    created: meta.creation,
                    id: meta.id
                };

                const savePath = path.join(baseDir, name);
                fs.mkdirSync(savePath, { recursive: true });
                fs.writeFileSync(path.join(savePath, 'groupData.json'), JSON.stringify(groupData, null, 2));

                try {
                    const pfp = await sock.profilePictureUrl(groupJid, 'image');
                    if (!pfp) {
                        console.log('لا توجد صورة للمجموعة.');
                    } else {
                        const res = await fetch(pfp);
                        if (!res.ok) throw new Error(`فشل تحميل الصورة: ${res.status} ${res.statusText}`);
                        const buffer = await res.arrayBuffer();
                        fs.writeFileSync(path.join(savePath, `${name}.jpg`), Buffer.from(buffer));
                        console.log('تم حفظ صورة المجموعة بنجاح.');
                    }
                } catch (error) {
                    console.log('خطأ عند جلب صورة المجموعة:', error.message || error);
                }

                return await sock.sendMessage(groupJid, { text: `✅ تم حفظ النسخة: ${name}` }, { quoted: msg });
            }

            if (action === 'لصق') {
                if (!name) return await sock.sendMessage(groupJid, { text: '❗ اكتب اسم النسخة للصقها.\nمثال: .نسخة لصق مجموعة1' }, { quoted: msg });

                const dataPath = path.join(baseDir, name, 'groupData.json');
                if (!fs.existsSync(dataPath)) return await sock.sendMessage(groupJid, { text: `❌ النسخة "${name}" غير موجودة.` }, { quoted: msg });

                const data = JSON.parse(fs.readFileSync(dataPath));
                await sock.groupUpdateSubject(groupJid, data.subject);
                await sock.groupUpdateDescription(groupJid, data.description);
                await sock.groupSettingUpdate(groupJid, data.settings.announce ? 'announcement' : 'not_announcement');
                await sock.groupSettingUpdate(groupJid, data.settings.restrict ? 'locked' : 'unlocked');

                const imgPath = path.join(baseDir, name, `${name}.jpg`);
                if (fs.existsSync(imgPath)) {
                    try {
                        await sock.updateProfilePicture(groupJid, { url: imgPath });
                        console.log('تم تحديث صورة المجموعة.');
                    } catch (err) {
                        console.log('خطأ عند تحديث صورة المجموعة:', err.message || err);
                    }
                } else {
                    console.log('لا توجد صورة محفوظة للنسخة.');
                }

                return await sock.sendMessage(groupJid, { text: `✅ تم لصق النسخة "${name}" بنجاح.` }, { quoted: msg });
            }

            if (action === 'حذف') {
                if (!name) return await sock.sendMessage(groupJid, { text: '❗ اكتب اسم النسخة لحذفها.\nمثال: .نسخة حذف مجموعة1' }, { quoted: msg });

                const delPath = path.join(baseDir, name);
                if (!fs.existsSync(delPath)) return await sock.sendMessage(groupJid, { text: `❌ النسخة "${name}" غير موجودة.` }, { quoted: msg });

                fs.rmSync(delPath, { recursive: true, force: true });
                return await sock.sendMessage(groupJid, { text: `✅ تم حذف النسخة: ${name}` }, { quoted: msg });
            }

            if (action === 'حافظة') {
                if (!fs.existsSync(baseDir)) return await sock.sendMessage(groupJid, { text: '❗ لا توجد نسخ محفوظة.' }, { quoted: msg });

                const list = fs.readdirSync(baseDir);
                if (list.length === 0) return await sock.sendMessage(groupJid, { text: '❗ لا توجد نسخ محفوظة.' }, { quoted: msg });

                let reply = '*📁 النسخ المحفوظة:*\n\n';
                list.forEach((n, i) => reply += `${i + 1}. ${n}\n`);
                return await sock.sendMessage(groupJid, { text: reply }, { quoted: msg });
            }

            return await sock.sendMessage(groupJid, {
                text: '❌ أمر غير معروف.\nالاستخدام:\n.نسخة نسخ [اسم]\n.نسخة لصق [اسم]\n.نسخة حذف [اسم]\n.نسخة حافظة'
            }, { quoted: msg });
        } catch (err) {
            console.error('❌ خطأ في أمر النسخة:', err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ:\n${err.message || err}`
            }, { quoted: msg });
        }
    }
};
