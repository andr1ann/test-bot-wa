import config from '../config.js';
import logger from '../utils/logger.js';

/**
 * COMMAND: info
 * Tampilkan informasi bot dan owner
 * 
 * Penggunaan: .info
 * Aliases: .i
 * 
 * Menampilkan:
 * - Nama bot
 * - Nama owner
 * - Nomor owner
 * - Prefix yang digunakan
 * - Platform dan library yang digunakan
 * - Bot runtime (berapa lama bot sudah berjalan)
 */
export default {
  name: 'info',
  aliases: ['i'],
  description: 'Tampilkan informasi bot',

  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;
    
    try {
      // Hitung uptime bot (berapa detik sudah berjalan)
      const uptimeSeconds = Math.floor(process.uptime());
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      const uptimeHours = Math.floor(uptimeMinutes / 60);
      const uptimeDays = Math.floor(uptimeHours / 24);

      let uptimeText = '';
      if (uptimeDays > 0) {
        uptimeText = `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m`;
      } else if (uptimeHours > 0) {
        uptimeText = `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`;
      } else if (uptimeMinutes > 0) {
        uptimeText = `${uptimeMinutes}m ${uptimeSeconds % 60}s`;
      } else {
        uptimeText = `${uptimeSeconds}s`;
      }

      const infoText = `
╔════════════════════════════════════╗
║     📱 BOT INFORMATION             ║
╠════════════════════════════════════╣
║                                    ║
║ 🤖 Nama Bot      : ${config.botName.padEnd(25)}║
║ 👤 Owner         : ${config.ownerName.padEnd(25)}║
║ 📞 Nomor Owner   : ${config.ownerNumber.padEnd(25)}║
║ 🎯 Prefix        : ${config.prefix.padEnd(25)}║
║ 🔧 Platform      : Node.js         ║
║ 📦 Library       : Baileys         ║
║ ⏱️  Runtime       : ${uptimeText.padEnd(25)}║
║                                    ║
╚════════════════════════════════════╝`;

      await sock.sendMessage(sender, {
        text: infoText,
      });

      logger.info(`✅ Info command executed for ${sender}`);

    } catch (error) {
      logger.error('Error executing info command:', error);
      throw error;
    }
  },
};
