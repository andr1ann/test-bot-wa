import config from '../config.js';
import logger from '../utils/logger.js';
import { loadCommands, findCommand } from '../utils/commandLoader.js';

// Cache untuk commands agar tidak reload setiap kali
let commandsCache = null;

/**
 * Load dan cache semua commands
 * @returns {Promise<Array>} Array dari command objects
 */
async function getCommands() {
  if (!commandsCache) {
    logger.info('Loading commands for first time...');
    commandsCache = await loadCommands();
  }
  return commandsCache;
}

/**
 * Handle incoming command dari user
 * 
 * Flow:
 * 1. Cek apakah message dimulai dengan prefix
 * 2. Extract command name dan arguments
 * 3. Cari command di database
 * 4. Execute command
 * 5. Handle error jika ada
 * 
 * @param {string} text - Text pesan dari user
 * @param {Object} sock - Socket connection dari Baileys
 * @param {Object} msg - Message object dari Baileys
 */
export async function handleCommand(text, sock, msg) {
  try {
    // Get cached commands
    const commands = await getCommands();

    const sender = msg.key.remoteJid;
    const trimmedText = text.trim();

    // ==================== 1. CHECK PREFIX ====================
    if (!trimmedText.startsWith(config.prefix)) {
      return; // Bukan command, abaikan
    }

    // ==================== 2. EXTRACT COMMAND ====================
    // Hapus prefix dari text
    const commandText = trimmedText.slice(config.prefix.length).trim();
    
    // Pisahkan command name dan arguments
    // Contoh: "ping hello world" → name="ping", args=["hello", "world"]
    const [commandName, ...args] = commandText.split(/\s+/);

    if (!commandName) {
      return; // Command name kosong, abaikan
    }

    // ==================== 3. FIND COMMAND ====================
    const command = findCommand(commands, commandName);

    if (!command) {
      // Command tidak ditemukan
      logger.warn(`❌ Command not found: ${commandName}`);
      
      await sock.sendMessage(sender, {
        text: `❌ Command "${commandName}" tidak ditemukan.\n\nGunakan "${config.prefix}menu" untuk melihat daftar command.`,
      });
      return;
    }

    // ==================== 4. EXECUTE COMMAND ====================
    logger.info(`⚡ Executing command: ${command.name} | Args: [${args.join(', ')}]`);

    try {
      await command.execute(sock, msg, args);
    } catch (commandError) {
      logger.error(`Error executing command ${command.name}:`, commandError);
      
      await sock.sendMessage(sender, {
        text: `❌ Error saat menjalankan command "${command.name}".\n\nError: ${commandError.message}`,
      });
    }

  } catch (error) {
    logger.error('Critical error in command handler:', error);
    
    try {
      const sender = msg.key.remoteJid;
      await sock.sendMessage(sender, {
        text: '❌ Terjadi error kritikal saat memproses command.\n\nSilakan coba lagi atau restart bot.',
      });
    } catch (sendError) {
      logger.error('Error sending error message:', sendError);
    }
  }
}

/**
 * Reload commands (untuk development)
 * Gunakan jika menambah command baru tanpa restart bot
 */
export async function reloadCommands() {
  logger.info('🔄 Reloading commands...');
  commandsCache = null;
  const commands = await getCommands();
  logger.info(`✅ Commands reloaded: ${commands.length} command(s)`);
  return commands;
}

/**
 * Get semua commands (untuk menampilkan menu)
 * @returns {Promise<Array>} Array dari command objects
 */
export async function getAllCommands() {
  return getCommands();
}
