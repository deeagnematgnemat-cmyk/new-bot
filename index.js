import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@yemo-dev/yebail';
import pino from 'pino';

const BOT_CONFIG = {
    name: '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』',
    phoneNumber: '962795106901',
    developerNumber: '962796163926'
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ["Chrome", "Desktop", "3.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    // التحقق من حالة الاتصال وطلب رمز الاقتران إذا لم يكن مسجلاً
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(BOT_CONFIG.phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n=============================================`);
                console.log(`🔗 رمز الاقتران للبوت [${BOT_CONFIG.name}]: ${code}`);
                console.log(`=============================================\n`);
            } catch (e) {
                console.error("فشل في توليد رمز الاقتران:", e);
            }
        }, 4000);
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(`انقطع الاتصال بسبب السبب رقم: ${reason}، جاري إعادة المحاولة...`);
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            } else {
                console.log('تم تسجيل الخروج، يرجى حذف مجلد session لإعادة الربط.');
            }
        } else if (connection === 'open') {
            console.log(`✅ تم اتصال البوت [${BOT_CONFIG.name}] بنجاح وهاتفك متصل الآن!`);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (textMessage === 'مرحبا') {
            await sock.sendMessage(sender, { text: `أهلاً بك! أنا بوت ${BOT_CONFIG.name} أعمل بنجاح 🍷` });
        }
    });
}

startBot();
