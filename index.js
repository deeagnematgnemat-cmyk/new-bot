// Eren Bot v1.0.2 - تشغيل نظيف ومعزول
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@yemo-dev/yebail');
const pino = require('pino');

const BOT_NAME = '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』';
const BOT_NUMBER = '962795106901';

async function startBot() {
    // 📁 استخدام اسم مجلد جديد كلياً لتخطي أي ملفات كاش معطوبة في سيرفر Railway
    const { state, saveCreds } = await useMultiFileAuthState('session_eren');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.windows('Desktop')
    });

    sock.ev.on('creds.update', saveCreds);

    let pairingRequested = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (!sock.authState.creds.registered && !pairingRequested) {
            pairingRequested = true;
            console.log(`[!] جارٍ طلب كود الاقتران لرقم البوت: ${BOT_NUMBER}...`);
            
            setTimeout(async () => {
                try {
                    const code = await sock.requestPairingCode(BOT_NUMBER);
                    console.log('\n===========================================');
                    console.log(`🔐 كود اقتران واتساب الخاص بك هو: ${code}`);
                    console.log('===========================================\n');
                } catch (err) {
                    console.error('❌ فشل توليد الكود، المحاولة قائمة مجدداً...', err);
                }
            }, 5000); // 5 ثوانٍ انتظار لضمان استقرار السيرفر كلياً
        }

        if (connection === 'close') {
            console.log('🔌 تم إغلاق الاتصال، جارٍ إعادة تشغيل البوت تلقائياً...');
            startBot();
        } else if (connection === 'open') {
            console.log(`\n✅ تم اتصال البوت [ ${BOT_NAME} ] بنجاح وهو يعمل الآن! 🍷\n`);
        }
    });
}

// بدء التشغيل
startBot();
