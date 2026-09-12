import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configuration object
const config = {
  // Bot settings
  prefix: process.env.PREFIX || '.',
  botName: process.env.BOT_NAME || 'WhatsApp Bot',
  ownerName: process.env.OWNER_NAME || 'Owner',
  ownerNumber: process.env.OWNER_NUMBER || '62000000000',
  
  // Debug mode
  debug: process.env.DEBUG === 'true' || false,
  
  // Session directory
  sessionDir: './sessions',
  
  // API settings
  sessionsDir: './sessions',
  printQRInTerminal: true,
  browser: ['Ubuntu', 'Chrome', '91.0.4472.124'], // Spoof browser untuk Baileys
};

export default config;
