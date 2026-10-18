// Eren Bot v1.0.3 - الإصدار الرسمي المعتمد للمكتبة
const { Client } = require('@yemo-dev/yebail');

const BOT_NAME = '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』';
const BOT_NUMBER = '962795106901';

console.log(`[+] جارٍ بدء تهيئة العميل لـ: ${BOT_NAME}...`);

// إنشاء اتصال باستخدام محرك المكتبة الرسمي مع تفعيل الجلسة وكود الاقتران
const client = new Client({
    name: "session_eren", // اسم مجلد الجلسة
    pairingCode: true     // تفعيل ميزة الاقتران عبر رقم الهاتف
});

let isCodeRequested = false;

// الاستماع لحدث طلب الاتصال (توليد الكود)
client.on('qr', async () => {
    if (!isCodeRequested) {
        isCodeRequested = true;
        console.log(`[!] طلب كود الاقتران من خوادم واتساب للرقم: ${BOT_NUMBER}`);
        
        // تأخير 5 ثوانٍ لضمان استقرار حاوية سيرفر Railway
        setTimeout(async () => {
            try {
                const code = await client.getPairingCode(BOT_NUMBER);
                console.log('\n===========================================');
                console.log(`🔐 كود اقتران واتساب الخاص بك هو: ${code}`);
                console.log('===========================================\n');
            } catch (error) {
                console.error('❌ خطأ أثناء توليد كود الاقتران:', error);
                isCodeRequested = false; // إعادة المحاولة في حال الفشل
            }
        }, 5000);
    }
});

// عند نجاح عملية الاقتران والاتصال
client.on('ready', () => {
    console.log(`\n✅ تم اتصال البوت [ ${BOT_NAME} ] بنجاح وهو يعمل الآن بانتظام! 🍷\n`);
});

// تشغيل البوت رسمياً
client.login();
