import config from '../config.js';
import { loadCommands } from '../utils/commandLoader.js';
import logger from '../utils/logger.js';

/**
 * COMMAND: menu
 * Menampilkan daftar semua command yang tersedia
 * 
 * Penggunaan: .menu
 * Aliases: .m, .help, .h
 * 
 * Fitur:
 * - Tampil nama bot dan owner dari config
 * - Tampil semua command dengan deskripsi
 * - Tampil aliases untuk setiap command
 * - Format rapi dengan box drawing characters
 * - OTOMATIS membaca semua command dari folder src/commands
 */
export default {
  name: 'menu',
  aliases: ['m', 'help', 'h'],
  description: 'Tampilkan daftar semua command',

  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;

    try {
      // Load all commands
      const commands = await loadCommands();

      // Build menu text
      let menuText = `
╔════════════════════════════════════╗
║     🤖 ${config.botName.padEnd(32)}║
╠════════════════════════════════════╣
║                                    ║
`;

      // Tambahkan setiap command ke menu
      for (const cmd of commands) {
        // Format: .command (alias1, alias2) - Description
        const aliasText = cmd.aliases && cmd.aliases.length > 0 
          ? ` (${cmd.aliases.join(', ')})` 
          : '';
        
        const commandLine = `${config.prefix}${cmd.name}${aliasText}`;
        const description = cmd.description || 'No description';
        
        // Potong text jika terlalu panjang
        const maxLength = 32;
        const shortDesc = description.length > maxLength 
          ? description.substring(0, maxLength - 3) + '...' 
          : description;

        menuText += `║ • ${commandLine.padEnd(30)}║\n`;
        menuText += `║   ${shortDesc.padEnd(30)}║\n`;
      }

      menuText += `║                                    ║
╠════════════════════════════════════╣
║                                    ║
║ 👤 Owner: ${config.ownerName.padEnd(26)}║
║ 📌 Prefix: ${config.prefix.padEnd(26)}║
║                                    ║
║ Gunakan prefix "${config.prefix}" sebelum    ║
║ nama command untuk menjalankannya  ║
║                                    ║
╚════════════════════════════════════╝`;

      // Kirim menu ke user
      await sock.sendMessage(sender, {
        text: menuText,
      });

      logger.info(`✅ Menu sent to ${sender}`);

    } catch (error) {
      logger.error('Error generating menu:', error);
      
      await sock.sendMessage(sender, {
        text: `❌ Error saat membuat menu: ${error.message}`,
      });
      
      throw error;
    }
  },
};
