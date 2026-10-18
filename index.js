const { default: makeWASocket, useMultiFileAuthState, Browsers, delay } = require('@yemo-dev/yebail');
const pino = require('pino');
const http = require('http');

const BOT_NAME = '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』';
const BOT_NUMBER = '962795106901';

// خادم ويب مدمج لإبقاء الحاوية مستيقظة في Railway
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`البوت يعمل بثبات!`);
}).listen(PORT);

async function startBot() {
    console.log(`[+] جارٍ بدء تشغيل البوت الاحترافي: ${BOT_NAME}...`);

    const { state, saveCreds } = await useMultiFileAuthState('session_yebail_auth');

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
            await delay(5000); // وقت انتظار لضمان استقرار الشبكة
            try {
                console.log(`[!] طلب كود الاقتران لرقم البوت: ${BOT_NUMBER}`);
                const code = await sock.requestPairingCode(BOT_NUMBER);
                console.log('\n===========================================');
                console.log(`🔐 كود اقتران واتساب الخاص بك هو: ${code}`);
                console.log('===========================================\n');
            } catch (error) {
                console.error('❌ فشل جلب الكود:', error.message);
                pairingRequested = false;
            }
        }

        if (connection === 'open') {
            console.log(`\n✅ تم اتصال البوت [ ${BOT_NAME} ] بنجاح بالواتساب ومستعد للأزرار! 🍷\n`);
        } else if (connection === 'close') {
            console.log('🔌 انقطع الاتصال، جارٍ إعادة التشغيل تلقائياً...');
            startBot();
        }
    });
}

startBot().catch(err => console.error(err));
