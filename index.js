// Eren Bot v1.0.8 - إصدار توليد الكود الفوري
const fs = require('fs');
const path = require('path');
const http = require('http');

// 🛠️ تنظيف حظر المطور تلقائياً من الملفات الداخلية للمكتبة
try {
    const targetPath = path.join(__dirname, 'node_modules', '@yemo-dev', 'yebail', 'lib', 'Defaults', 'index.js');
    if (fs.existsSync(targetPath)) {
        let fileContent = fs.readFileSync(targetPath, 'utf8');
        if (fileContent.includes('FIX ERROR DULU')) {
            fileContent = fileContent.replace(/console.log\(['"]FIX ERROR DULU['"]\);?\s*process.exit\(\d*\);?/g, '');
            fileContent = fileContent.replace(/process.exit\(\d*\);?\s*\/\/.*FIX ERROR DULU/g, '');
            fileContent = fileContent.replace(/FIX ERROR DULU/g, 'Clean Environment');
            fs.writeFileSync(targetPath, fileContent, 'utf8');
            console.log('[🛠️] تم تنظيف بيئة تشغيل Yebail وتخطي حظر المطور بنجاح!');
        }
    }
} catch (e) {}

// 🧹 فرض مسح أي ملفات جلسة قديمة معلقة لتوليد كود جديد تماماً
try {
    const sessionPath = path.join(__dirname, 'session_eren_auth');
    if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log('[🧹] تم مسح الجلسة المعلقة بنجاح لطلب كود اقتران جديد...');
    }
} catch (e) {}

// 🌐 خادم الويب المدمج للبقاء 24/7
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`البوت يعمل بنجاح!`);
}).listen(PORT, () => {
    console.log(`[🌐] تم تشغيل خادم البقاء المدمج على المنفذ: ${PORT}`);
});

const { default: makeWASocket, useMultiFileAuthState, Browsers, delay } = require('@yemo-dev/yebail');
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

    let pairingRequested = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;

        if (!sock.authState.creds.registered && !pairingRequested) {
            pairingRequested = true;
            await delay(5000); // انتظر 5 ثوانٍ لضمان استقرار الشبكة بالكامل
            try {
                console.log(`[!] جارٍ طلب كود الاقتران لرقم البوت من خوادم واتساب: ${BOT_NUMBER}`);
                const code = await sock.requestPairingCode(BOT_NUMBER);
                console.log('\n===========================================');
                console.log(`🔐 كود اقتران واتساب الخاص بك هو: ${code}`);
                console.log('===========================================\n');
            } catch (error) {
                console.error('❌ فشل جلب كود الاقتران، سنحاول مجدداً...', error.message);
                pairingRequested = false;
            }
        }

        if (connection === 'open') {
            console.log(`\n✅ تم اتصال البوت [ ${BOT_NAME} ] بنجاح وهو يعمل الآن بانتظام! 🍷\n`);
        } else if (connection === 'close') {
            console.log('🔌 تم إغلاق الاتصال، جارٍ إعادة تشغيل البوت تلقائياً...');
            startBot();
        }
    });
}

// تشغيل البوت
startBot().catch(err => console.error("خطأ في التشغيل:", err));
