import { makeWASocket, useMultiFileAuthState } from '@yemo-dev/yebail';
import pino from 'pino';

async function startBot() {
    console.log("🚀 جاري بدء تشغيل بوت 『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』...");
    
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            console.log('🔄 انقطع الاتصال، جاري إعادة المحاولة...');
            startBot();
        } else if (connection === 'open') {
            console.log('✅ تم اتصال البوت بنجاح تام!');
        }
    });
}

startBot();
