const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@yemo-dev/yebail');
const pino = require('pino');

// إعدادات البوت الثابتة والمحفوظة للأبد
const BOT_NAME = '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』';
const BOT_NUMBER = '962795106901';

async function startBot() {
    // 📁 إنشاء مجلد لحفظ الجلسة تلقائياً لمنع تسجيل الخروج مستقبلاً
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');

    // تهيئة عميل الواتساب بالصيغة الصحيحة لمكتبة Yebail
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }), // إخفاء السجلات المزعجة
        browser: Browsers.windows('Desktop') // تزييف المتصفح لمنع الحظر
    });

    // حفظ بيانات الجلسة فور حدوث أي تحديث للاتصال
    sock.ev.on('creds.update', saveCreds);

    let pairingRequested = false;

    // مراقبة حالة الاتصال والاقتران
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // إذا لم يكن الحساب مسجلاً، نطلب كود الاقتران فوراً
        if (!sock.authState.creds.registered && !pairingRequested) {
            pairingRequested = true;
            try {
                console.log(`[!] جارٍ طلب كود الاقتران لرقم البوت: ${BOT_NUMBER}...`);
                
                // تأخير بسيط بمقدار 4 ثوانٍ لضمان استقرار السيرفر قبل طلب الكود
                setTimeout(async () => {
                    const code = await sock.requestPairingCode(BOT_NUMBER);
                    console.log('\n===========================================');
                    console.log(`🔐 كود اقتران واتساب الخاص بك هو: ${code}`);
                    console.log('===========================================\n');
                }, 4000);

            } catch (error) {
                console.error('❌ فشل جلب كود الاقتران، السبب:', error);
            }
        }

        // التعامل مع انقطاع الاتصال وإعادة التشغيل تلقائياً
        if (connection === 'close') {
            console.log('🔌 تم إغلاق الاتصال، جارٍ إعادة تشغيل البوت تلقائياً...');
            startBot();
        } else if (connection === 'open') {
            console.log(`\n✅ تم اتصال البوت [ ${BOT_NAME} ] بنجاح وهو يعمل الآن! 🍷\n`);
        }
    });
}

// تشغيل البوت
startBot();
