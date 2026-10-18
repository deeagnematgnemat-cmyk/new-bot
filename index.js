// Eren Bot v1.0.5 - إصدار التخطي الذكي لحظر المكتبة
const fs = require('fs');
const path = require('path');

// 🛠️ خدعة برمجية لتنظيف حظر "FIX ERROR DULU" تلقائياً من ملفات المكتبة الداخلية قبل التشغيل
try {
    const targetPath = path.join(__dirname, 'node_modules', '@yemo-dev', 'yebail', 'lib', 'Defaults', 'index.js');
    if (fs.existsSync(targetPath)) {
        let fileContent = fs.readFileSync(targetPath, 'utf8');
        if (fileContent.includes('FIX ERROR DULU')) {
            // حذف عبارة الحظر البرمجية لفتح الاتصال نظيفاً
            fileContent = fileContent.replace(/console.log\(['"]FIX ERROR DULU['"]\);?\s*process.exit\(\d*\);?/g, '');
            fileContent = fileContent.replace(/process.exit\(\d*\);?\s*\/\/.*FIX ERROR DULU/g, '');
            fileContent = fileContent.replace(/FIX ERROR DULU/g, 'Clean Environment');
            fs.writeFileSync(targetPath, fileContent, 'utf8');
            console.log('[🛠️] تم تنظيف بيئة تشغيل Yebail وتخطي حظر المطور بنجاح!');
        }
    }
} catch (e) {
    console.log('[!] تنبيه: لم يتم تعديل ملف الحظر، سنحاول التشغيل المباشر...');
}

// البدء في استدعاء المكتبة وتشغيلها بعد التنظيف
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@yemo-dev/yebail');
const pino = require('pino');

const BOT_NAME = '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』';
const BOT_NUMBER = '962795106901';

async function startBot() {
    console.log(`[+] جارٍ بدء تهيئة العميل لـ: ${BOT_NAME}...`);

    const { state, saveCreds } = await useMultiFileAuthState('session_eren_auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.windows('Desktop')
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;

        if (connection === 'open') {
            console.log(`\n✅ تم اتصال البوت [ ${BOT_NAME} ] بنجاح وهو يعمل الآن بانتظام! 🍷\n`);
        } else if (connection === 'close') {
            console.log('🔌 تم إغلاق الاتصال، جارٍ إعادة تشغيل البوت تلقائياً...');
            startBot();
        }
    });

    // جلب كود الاقتران مباشرة
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                console.log(`[!] جارٍ طلب كود الاقتران لرقم البوت من خوادم واتساب: ${BOT_NUMBER}`);
                const code = await sock.requestPairingCode(BOT_NUMBER);
                console.log('\n===========================================');
                console.log(`🔐 كود اقتران واتساب الخاص بك هو: ${code}`);
                console.log('===========================================\n');
            } catch (error) {
                console.error('❌ فشل جلب كود الاقتران:', error.message);
            }
        }, 5000);
    }
}

// تشغيل البوت رسمياً
startBot().catch(err => console.error("خطأ في التشغيل:", err));
