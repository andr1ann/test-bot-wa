import logger from '../utils/logger.js';

/**
 * COMMAND: ping
 * Cek apakah bot masih aktif dan responsif
 * 
 * Penggunaan: .ping
 * Aliases: .p
 * 
 * Response: "🏓 Pong! Bot aktif."
 */
export default {
  name: 'ping',
  aliases: ['p'],
  description: 'Cek apakah bot aktif',

  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;
    
    try {
      await sock.sendMessage(sender, {
        text: '🏓 Pong! Bot aktif.',
      });
      
      logger.info(`✅ Ping command executed for ${sender}`);
    } catch (error) {
      logger.error('Error executing ping command:', error);
      throw error;
    }
  },
};
