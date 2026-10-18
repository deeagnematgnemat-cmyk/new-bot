const { Client } = require('@yemo-dev/yebail');

// إعدادات البوت الثابتة والمحفوظة
const BOT_NAME = '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝓉 『✦』';
const BOT_NUMBER = '962795106901'; // رقم حساب البوت
const DEVELOPER_NUMBER = '962796163926'; // رقم حساب المطور

console.log(`جارٍ بدء تشغيل بوت: ${BOT_NAME}...`);

// إنشاء عميل واتساب جديد مع تفعيل خيار حفظ الجلسة محلياً
const client = new Client({
    name: BOT_NAME,
    pairingCode: true // تفعيل ميزة الاقتران عبر رقم الهاتف
});

// عند جاهزية البوت للاتصال، سيطلب كود الاقتران للرقم المحدد
client.on('qr', async () => {
    try {
        console.log(`[!] طلب كود الاقتران لرقم البوت: ${BOT_NUMBER}`);
        const code = await client.getPairingCode(BOT_NUMBER);
        console.log('-------------------------------------------');
        console.log(`🔐 كود اقتران واتساب الخاص بك هو: ${code}`);
        console.log('-------------------------------------------');
    } catch (error) {
        console.error('خطأ أثناء جلب كود الاقتران:', error);
    }
});

// عند نجاح الاتصال بالواتساب
client.on('ready', () => {
    console.log(`✅ تم اتصال البوت ${BOT_NAME} بنجاح وهو يعمل الآن!`);
});

// بدء تشغيل البوت
client.login();
