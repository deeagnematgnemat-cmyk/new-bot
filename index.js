// Eren Bot v1.0.4 - الإصدار الرسمي المعتمد من وثائق Yebail
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@yemo-dev/yebail');
const pino = require('pino');

const BOT_NAME = '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』';
const BOT_NUMBER = '962795106901';

async function startBot() {
    console.log(`[+] جارٍ بدء تهيئة العميل لـ: ${BOT_NAME}...`);

    // 📁 إنشاء مجلد مستقل لحفظ الجلسة
    const { state, saveCreds } = await useMultiFileAuthState('session_eren_auth');

    // إنشاء اتصال الواتساب بالصيغة الرسمية والموثقة للمكتبة
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // إيقاف الـ QR لأننا نريد كود الاقتران
        logger: pino({ level: 'silent' }), // إخفاء سجلات pino المزعجة
        browser: Browsers.windows('Desktop') // تزييف نوع الجهاز لمنع الحظر
    });

    // حفظ بيانات الجلسة تلقائياً عند الاقتران
    sock.ev.on('creds.update', saveCreds);

    // الاستماع لتحديثات حالة الاتصال
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        // عند فتح الاتصال بنجاح
        if (connection === 'open') {
            console.log(`\n✅ تم اتصال البوت [ ${BOT_NAME} ] بنجاح وهو يعمل الآن بانتظام! 🍷\n`);
        } 
        
        // عند حدوث انقطاع أو إغلاق للاتصال، يعيد التشغيل تلقائياً
        else if (connection === 'close') {
            console.log('🔌 تم إغلاق الاتصال، جارٍ إعادة تشغيل البوت تلقائياً...');
            startBot();
        }
    });

    // 🔐 جلب كود الاقتران فوراً إذا لم يكن الحساب مسجلاً من قبل
    if (!sock.authState.creds.registered) {
        // تأخير ذكي لمدة 6 ثوانٍ كاملة لضمان استقرار السيرفر وتجنب رسالة FIX ERROR DULU
        setTimeout(async () => {
            try {
                console.log(`[!] جارٍ طلب كود الاقتران لرقم البوت من خوادم واتساب: ${BOT_NUMBER}`);
                const code = await sock.requestPairingCode(BOT_NUMBER);
                console.log('\n===========================================');
                console.log(`🔐 كود اقتران واتساب الخاص بك هو: ${code}`);
                console.log('===========================================\n');
            } catch (error) {
                console.error('❌ فشل جلب كود الاقتران، سنحاول مجدداً عند إعادة التشغيل:', error.message);
            }
        }, 6000);
    }
}

// تشغيل البوت رسمياً
startBot().catch(err => console.error("خطأ غير متوقع في التشغيل الأساسي:", err));
