
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestWaWebVersion,
  Browsers
} from '@yemo-dev/yebail';

import pino from 'pino';
import fs from 'node:fs';

const BOT_NAME = '『✦』 𝐸𝓇𝑒𝓃 🍷 𝐵𝑜𝑡 『✦』';

async function startBot() {
  console.log(`Starting ${BOT_NAME}...`);

  const phoneNumber = process.env.BOT_PHONE_NUMBER?.replace(/\D/g, '');

  if (!phoneNumber) {
    throw new Error(
      'Missing BOT_PHONE_NUMBER environment variable.'
    );
  }

  const { state, saveCreds } =
    await useMultiFileAuthState('./auth_info');

  const { version } = await fetchLatestWaWebVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: Browsers.windows('Eren Bot'),
    printQRInTerminal: false,
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`${BOT_NAME} connected successfully.`);
    }

    if (connection === 'close') {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;

      console.log('Connection closed. Status:', statusCode);

      if (statusCode !== DisconnectReason.loggedOut) {
        console.log('Reconnecting in 5 seconds...');
        setTimeout(() => {
          startBot().catch(console.error);
        }, 5000);
      } else {
        console.log(
          'Session logged out. Pair the account again.'
        );
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const chatId = msg.key.remoteJid;
      if (!chatId) continue;

      console.log('Received a message from:', chatId);
    }
  });

  if (!state.creds.registered) {
    const code = await sock.requestPairingCode(phoneNumber);
    console.log('PAIRING CODE:', code);
    console.log('Enter this code in WhatsApp on your phone.');
  }
}

startBot().catch((error) => {
  console.error('Bot startup failed:', error);
  process.exitCode = 1;
});
