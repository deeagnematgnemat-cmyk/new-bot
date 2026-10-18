import { makeWASocket, useMultiFileAuthState } from '@yemo-dev/yebail';
import pino from 'pino';

async function startBot() {
    // إعداد حفظ الجلسة محلياً أو في مجلد لضمان عدم فقدان الاتصال
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true, // سيطبع رمز QR للربط (أو سنتابع ربطه حسب دعم المكتبة)
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log("رمز الاستجابة السريعة (QR) جاهز، سيظهر في السجلات أو يمكنك مسحه.");
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 403;
            console.log('تم انقطاع الاتصال، جاري إعادة المحاولة...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('✅ تم اتصال البوت بنجاح وحساب واتساب يعمل الآن!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

        console.log(`رسالة مستلمة من ${sender}: ${textMessage}`);

        // رد تجريبي بسيط للتأكد من عمل البوت
        if (textMessage === 'مرحبا') {
            await sock.sendMessage(sender, { text: 'أهلاً بك! أنا بوت 𝐸𝓇𝑒𝓃 أعمل بنجاح 🍷' });
        }
    });
}

startBot();
