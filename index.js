import { makeWASocket, useMultiFileAuthState } from '@yemo-dev/yebail';
import pino from 'pino';

// بيانات البوت والمطور الثابتة
const BOT_CONFIG = {
    name: '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』',
    phoneNumber: '962795106901', // رقم البوت بدون + أو مساحات
    developerNumber: '962796163926'
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // تعطيل QR لاستخدام رمز الاقتران
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // إذا لم يكن الحساب مسجلاً وتم طلب الاتصال، نطلب رمز الاقتران
        if (!sock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    const pairingCode = await sock.requestPairingCode(BOT_CONFIG.phoneNumber);
                    console.log(`\n=============================================`);
                    console.log(`🔗 رمز اقتران واتساب الخاص بالبوت [${BOT_CONFIG.name}]:`);
                    console.log(`👉 CODE: ${pairingCode}`);
                    console.log(`=============================================\n`);
                } catch (err) {
                    console.error('خطأ في طلب رمز الاقتران:', err);
                }
            }, 3000);
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 403;
            console.log('انقطع الاتصال، جاري إعادة المحاولة...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log(`✅ تم اتصال البوت [${BOT_CONFIG.name}] بنجاح!`);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

        console.log(`رسالة من ${sender}: ${textMessage}`);

        if (textMessage === 'مرحبا') {
            await sock.sendMessage(sender, { text: `أهلاً بك! أنا بوت ${BOT_CONFIG.name} أعمل بنجاح 🍷` });
        }
    });
}

startBot();
