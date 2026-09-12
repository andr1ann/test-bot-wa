import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Dynamically load all commands from commands directory
 * Otomatis membaca semua file .js di folder src/commands
 * 
 * @returns {Promise<Array>} Array berisi semua command objects
 * 
 * Struktur command:
 * {
 *   name: 'ping',
 *   aliases: ['p'],
 *   description: 'Cek bot aktif',
 *   execute: async function(sock, msg, args) {}
 * }
 */
export async function loadCommands() {
  const commands = [];
  const commandsDir = join(__dirname, '../commands');

  try {
    // Baca semua file di folder commands
    const files = readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    logger.info(`Found ${files.length} command file(s)`);

    // Load setiap file command
    for (const file of files) {
      try {
        const commandPath = join(commandsDir, file);
        
        // Import command file menggunakan file:// protocol
        const imported = await import(`file://${commandPath}`);
        const command = imported.default || imported;

        // Validasi struktur command
        if (!command.name) {
          logger.warn(`⚠️  Command di ${file} tidak memiliki property 'name' - skip`);
          continue;
        }

        if (typeof command.execute !== 'function') {
          logger.warn(`⚠️  Command di ${file} tidak memiliki fungsi 'execute()' - skip`);
          continue;
        }

        // Tambahkan command ke array
        commands.push(command);
        logger.info(`✅ Loaded command: .${command.name} (${file})`);
        
      } catch (error) {
        logger.error(`❌ Error loading command ${file}:`, error.message);
        continue;
      }
    }

    logger.info(`\n📦 Total ${commands.length} command siap digunakan\n`);
    return commands;

  } catch (error) {
    logger.error('Error reading commands directory:', error);
    return [];
  }
}

/**
 * Cari command berdasarkan nama atau alias
 * 
 * @param {Array} commands - Array dari commands
 * @param {string} commandName - Nama command yang dicari
 * @returns {Object|null} Command object atau null jika tidak ditemukan
 */
export function findCommand(commands, commandName) {
  const lowerName = commandName.toLowerCase();
  
  return commands.find(cmd => {
    // Check command name
    if (cmd.name.toLowerCase() === lowerName) {
      return true;
    }
    
    // Check aliases
    if (cmd.aliases && cmd.aliases.length > 0) {
      return cmd.aliases.some(alias => alias.toLowerCase() === lowerName);
    }
    
    return false;
  });
}
