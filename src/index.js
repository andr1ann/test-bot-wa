import {
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  isJidBroadcast,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import config from './config.js';
import logger from './utils/logger.js';
import { handleMessage } from './handlers/messageHandler.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure sessions directory exists
const sessionDir = join(__dirname, '..', config.sessionDir);
mkdirSync(sessionDir, { recursive: true });

/**
 * Initialize and start WhatsApp Bot
 */
async function startBot() {
  try {
    logger.info('🤖 Starting WhatsApp Bot...');
    logger.info(`Bot Name: ${config.botName}`);
    logger.info(`Prefix: ${config.prefix}`);

    // Load authentication state
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    // Create socket connection
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: config.browser,
      logger: logger,
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
    });

    /**
     * Handle connection updates
     */
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        logger.info('📱 QR Code diterima. Scan dengan WhatsApp Anda:');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'connecting') {
        logger.info('⏳ Connecting...');
      }

      if (connection === 'open') {
        logger.info('✅ Connected! Bot is ready.');
      }

      if (connection === 'close') {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          logger.warn('❌ Connection closed. Attempting reconnect...');
          // Reconnect after 5 seconds
          setTimeout(() => startBot(), 5000);
        } else {
          logger.warn('❌ Device logged out. Please delete sessions folder and restart.');
        }
      }
    });

    /**
     * Handle credential updates
     */
    sock.ev.on('creds.update', saveCreds);

    /**
     * Handle incoming messages
     */
    sock.ev.on('messages.upsert', async (m) => {
      for (const msg of m.messages) {
        // Ignore status broadcasts and own messages
        if (msg.key.remoteJid === 'status@broadcast' || msg.key.fromMe) {
          continue;
        }

        await handleMessage(msg, sock);
      }
    });

    /**
     * Handle presence updates (typing, recording)
     */
    sock.ev.on('presence.update', async (presenceUpdate) => {
      // You can handle presence updates here if needed
    });

    /**
     * Handle group updates
     */
    sock.ev.on('groups.upsert', async (groupsUpsert) => {
      // You can handle group updates here if needed
    });

    /**
     * Handle group metadata updates
     */
    sock.ev.on('groups.update', async (groupsUpdate) => {
      // You can handle group updates here if needed
    });

  } catch (error) {
    logger.error('Fatal error starting bot:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Bot shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Bot shutting down...');
  process.exit(0);
});

// Start the bot
startBot().catch((error) => {
  logger.error('Failed to start bot:', error);
  process.exit(1);
});
