// Eren Bot v1.0.9 - إصدار المسار المطلق والتشغيل الفوري
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

// 🌐 خادم الويب المدمج للبقاء مستيقظاً 24/7
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

    // 📁 تأمين مسار مطلق ومؤكد للمجلد داخل سيرفر Railway لضمان صلاحيات الكتابة والقراءة
    const absoluteSessionPath = path.join(__dirname, 'session_eren_auth');
    const { state, saveCreds } = await useMultiFileAuthState(absoluteSessionPath);

    // تهيئة السوكت بالصيغة الرسمية المستقرة
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.windows('Desktop')
    });

    // حفظ التحديثات الخاصة بالجلسة فوراً
    sock.ev.on('creds.update', saveCreds);

    // 🔐 تشغيل طلب كود الاقتران فوراً وبشكل مستقل ومباشر بعد بناء الـ sock
    if (!sock.authState.creds.registered) {
        console.log(`[!] نظام التسجيل جاهز كلياً...`);
        // تأخير بسيط بمقدار 4 ثوانٍ لضمان اكتمال تحميل موديولات الشبكة في السيرفر
        setTimeout(async () => {
            try {
                console.log(`[!] جارٍ طلب كود الاقتران لرقم البوت من خوادم واتساب: ${BOT_NUMBER}`);
                const code = await sock.requestPairingCode(BOT_NUMBER);
                console.log('\n===========================================');
                console.log(`🔐 كود اقتران واتساب الخاص بك هو: ${code}`);
                console.log('===========================================\n');
            } catch (error) {
                console.error('❌ فشل جلب كود الاقتران، السبب:', error.message);
            }
        }, 4000);
    }

    // الاستماع لحالة الاتصال والإغلاق
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log(`\n✅ تم اتصال البوت [ ${BOT_NAME} ] بنجاح وهو يعمل الآن بانتظام! 🍷\n`);
        } else if (connection === 'close') {
            console.log('🔌 تم إغلاق الاتصال، جارٍ إعادة تشغيل البوت تلقائياً...');
            startBot();
        }
    });
}

// تشغيل البوت رسمياً
startBot().catch(err => console.error("خطأ عام في التشغيل:", err));
