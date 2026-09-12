import logger from '../utils/logger.js';
import { handleCommand } from './commandHandler.js';

/**
 * Handle pesan masuk dari WhatsApp
 * 
 * Flow:
 * 1. Ignore pesan dari bot sendiri (untuk mencegah loop)
 * 2. Extract text dari berbagai tipe message
 * 3. Log pesan yang diterima
 * 4. Pass ke command handler untuk diproses
 * 
 * @param {Object} msg - Message object dari Baileys
 * @param {Object} sock - Socket connection dari Baileys
 */
export async function handleMessage(msg, sock) {
  try {
    // ==================== 1. IGNORE BOT OWN MESSAGES ====================
    if (msg.key.fromMe) {
      return; // Abaikan pesan dari bot sendiri
    }

    // ==================== 2. EXTRACT MESSAGE TEXT ====================
    // WhatsApp memiliki berbagai tipe message
    // Kami extract text dari berbagai format
    const text =
      msg.message?.conversation || // Pesan teks biasa
      msg.message?.extendedTextMessage?.text || // Pesan teks extended (panjang)
      msg.message?.selectedButtonResponseInfo?.selectedDisplayText || // Tombol response
      msg.message?.imageMessage?.caption || // Caption gambar
      msg.message?.videoMessage?.caption || // Caption video
      msg.message?.audioMessage?.caption || // Caption audio
      msg.message?.documentMessage?.caption || // Caption dokumen
      '';

    // Jika tidak ada text, abaikan
    if (!text) {
      return;
    }

    // ==================== 3. GET SENDER INFO ====================
    const sender = msg.key.remoteJid;
    const isGroup = sender.includes('@g.us'); // Cek apakah dari grup
    const senderName = msg.pushName || 'Unknown';
    const messageType = msg.message?.conversation ? 'text' : 'other';

    // ==================== 4. LOG MESSAGE ====================
    const logPrefix = isGroup ? '📱 GROUP' : '💬 PRIVATE';
    logger.info(`${logPrefix} | ${senderName}: ${text.substring(0, 50)}`);

    // ==================== 5. HANDLE COMMAND ====================
    // Pass ke command handler untuk diproses
    await handleCommand(text, sock, msg);

  } catch (error) {
    logger.error('Error handling message:', error);

    // Jangan kirim error message ke user, cukup log
    // untuk menghindari spam notification
  }
}
