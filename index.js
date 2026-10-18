import { makeWASocket, useMultiFileAuthState } from '@yemo-dev/yebail';
import pino from 'pino';

const BOT_PHONE = "962795106901";

async function startBot() {
    console.log("🚀 جاري تهيئة الاتصال بواتساب...");
    
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(BOT_PHONE);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n================================`);
                console.log(`🔗 رمز الاقتران الخاص بك هو: ${code}`);
                console.log(`================================\n`);
            } catch (error) {
                console.error("خطأ أثناء طلب رمز الاقتران:", error);
            }
        }, 5000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ تم اتصال البوت 『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』 بنجاح تام!');
        } else if (connection === 'close') {
            console.log('🔄 انقطع الاتصال، جاري إعادة المحاولة...');
            startBot();
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (textMessage === 'مرحبا') {
            await sock.sendMessage(sender, { text: `أهلاً بك! أنا بوت 『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』 أعمل بنجاح 🍷` });
        }
    });
}

startBot();
