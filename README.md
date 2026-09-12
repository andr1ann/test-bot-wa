# WhatsApp Bot dengan Node.js & Baileys

Bot WhatsApp pribadi yang mudah dikonfigurasi dan dikembangkan, menggunakan **@whiskeysockets/baileys** library.

## 📋 Daftar Isi

- [Persyaratan](#persyaratan)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Cara Menjalankan](#cara-menjalankan)
- [Cara Login](#cara-login)
- [Membuat Command Baru](#membuat-command-baru)
- [Troubleshooting](#troubleshooting)

## 📦 Persyaratan

- **Node.js** versi 18.0.0 atau lebih baru ([Download](https://nodejs.org/))
- **npm** atau **yarn** (biasanya sudah termasuk dengan Node.js)
- **WhatsApp** aktif di smartphone

## 🚀 Instalasi

### 1. Clone atau Download Project

```bash
# Jika menggunakan git
git clone https://github.com/andr1ann/test-bot-wa.git
cd test-bot-wa

# Atau ekstrak folder jika download ZIP
```

### 2. Instalasi Dependencies

```bash
npm install
```

Tunggu sampai semua package selesai terinstall. Biasanya memakan waktu 2-5 menit tergantung kecepatan internet.

### 3. Setup Environment Variable

Buat file `.env` berdasarkan `.env.example`:

```bash
# Copy file example
cp .env.example .env
```

Edit file `.env` sesuai dengan data Anda:

```env
# .env
PREFIX=.
BOT_NAME=Andre Bot
OWNER_NAME=Andre
OWNER_NUMBER=628xxxxxxxxxx
DEBUG=false
```

**Penjelasan:**
- `PREFIX` - Karakter untuk memanggil command (default: `.`)
- `BOT_NAME` - Nama bot yang akan ditampilkan di menu
- `OWNER_NAME` - Nama pemilik bot
- `OWNER_NUMBER` - Nomor WhatsApp pemilik (format: 62812345678 untuk +62)
- `DEBUG` - Mode debug untuk log detail (true/false)

## ▶️ Cara Menjalankan

### Mode Normal

```bash
npm start
```

### Mode Development (auto-reload jika ada perubahan file)

```bash
npm run dev
```

## 📱 Cara Login

1. Jalankan bot dengan `npm start`
2. Akan muncul **QR Code** di terminal
3. Buka **WhatsApp** di smartphone Anda
4. Tap **3 titik (⋮)** → **Linked Devices** (atau **Perangkat Tertaut**)
5. Tap **Link a device**
6. **Scan QR Code** yang muncul di terminal

Jika berhasil:
- Akan muncul pesan: `✅ Connected! Bot is ready.`
- Bot siap menerima pesan dan command

## 🔧 Mengubah Konfigurasi

Semua pengaturan bot ada di file `.env`:

```env
# Ganti nama bot
BOT_NAME=Nama Bot Baru

# Ganti prefix command
PREFIX=!

# Ganti nama owner
OWNER_NAME=Nama Baru

# Ganti nomor owner
OWNER_NUMBER=628812345678
```

Simpan file, kemudian **restart bot** (`Ctrl+C` lalu `npm start` lagi).

## ➕ Membuat Command Baru

### Struktur Command

Setiap command adalah file JavaScript di folder `src/commands/`. Contoh struktur:

```javascript
// src/commands/hello.js
import logger from '../utils/logger.js';

export default {
  name: 'hello',                    // Nama command
  aliases: ['hi', 'halo'],          // Alias (opsional)
  description: 'Ucapan sambutan',   // Deskripsi

  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;
    
    // args[0] = argumen pertama, args[1] = argumen kedua, dst
    const name = args[0] || 'Teman';
    
    await sock.sendMessage(sender, {
      text: `Halo ${name}! 👋`,
    });
    
    logger.info(`Hello command executed`);
  },
};
```

### Contoh: Command dengan Argument

```javascript
// src/commands/greet.js
import logger from '../utils/logger.js';

export default {
  name: 'greet',
  aliases: ['g'],
  description: 'Ucapan dengan nama',

  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;
    const name = args.join(' ') || 'Teman';
    
    await sock.sendMessage(sender, {
      text: `Salam hangat untuk ${name}! 🙏`,
    });
  },
};
```

**Penggunaan:** `.greet Budi Santoso` → Bot balas: `Salam hangat untuk Budi Santoso! 🙏`

### Contoh: Command dengan Delay

```javascript
// src/commands/delay.js
import logger from '../utils/logger.js';

export default {
  name: 'delay',
  description: 'Respons dengan delay',

  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;
    
    await sock.sendMessage(sender, {
      text: 'Tunggu sebentar...',
    });
    
    // Tunggu 3 detik
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await sock.sendMessage(sender, {
      text: 'Selesai! ✅',
    });
  },
};
```

### Cara Menambah Command

1. Buat file baru di `src/commands/` dengan nama `namacommand.js`
2. Copy struktur command di atas
3. Ubah `name`, `aliases`, `description`, dan `execute()`
4. Simpan file
5. **Restart bot** atau jika pakai `npm run dev`, auto-reload

### ⭐ FITUR OTOMATIS - Command Auto-Detection!

**TIDAK PERLU MENGUBAH FILE APAPUN!** 

Command baru Anda akan **otomatis terdeteksi** saat bot startup. Sistem menggunakan `commandLoader.js` yang:
- ✅ Membaca semua file `.js` di folder `src/commands`
- ✅ Validasi struktur command
- ✅ Load ke memory dengan caching
- ✅ Tampil otomatis di menu (`.menu`)

Contoh: Membuat command `.covid`

```javascript
// src/commands/covid.js
import logger from '../utils/logger.js';

export default {
  name: 'covid',
  description: 'Informasi COVID-19',

  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;
    
    const covidInfo = `
📊 *INFORMASI COVID-19*

Silakan cek data terbaru di:
• covid19.go.id
• kemkes.go.id

Tetap jaga kesehatan! 🏥
    `.trim();
    
    await sock.sendMessage(sender, {
      text: covidInfo,
    });
  },
};
```

Gunakan: `.covid` → Bot otomatis meresponnya! ✅

## 🛑 Menghentikan Bot

Tekan `Ctrl+C` di terminal untuk menghentikan bot.

```bash
^C
Bot shutting down...
```

## 🔄 Logout / Reset Session

Jika ingin login ulang atau reset session:

1. Hentikan bot (`Ctrl+C`)
2. Hapus folder `sessions/`
3. Jalankan kembali `npm start`
4. Scan QR Code lagi

```bash
# Untuk menghapus session
rm -rf sessions/    # Linux/Mac
rmdir /s sessions   # Windows
```

## 📁 Struktur Project

```
test-bot-wa/
├── src/
│   ├── index.js                 # Entry point bot
│   ├── config.js                # Konfigurasi dari .env
│   ├── handlers/
│   │   ├── messageHandler.js    # Handler pesan masuk
│   │   └── commandHandler.js    # Handler command (AUTO-DETECT)
│   ├── commands/
│   │   ├── menu.js              # Command menu
│   │   ├── ping.js              # Command ping
│   │   ├── info.js              # Command info
│   │   └── sticker.js           # Command sticker (template)
│   └── utils/
│       ├── logger.js            # Logger dengan pino
│       └── commandLoader.js     # Auto-load commands ⭐
├── sessions/                    # Folder session (gitignore)
├── .env                         # Environment variables (gitignore)
├── .env.example                 # Template .env
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── README.md                    # Dokumentasi ini
```

## 🐛 Troubleshooting

### Error: "Cannot find module '@whiskeysockets/baileys'"

**Solusi:** Run `npm install` kembali

```bash
npm install
```

### Bot tidak menerima pesan

**Solusi:**
1. Pastikan sudah scan QR Code dengan benar
2. Restart bot: `Ctrl+C` lalu `npm start`
3. Cek nomor WhatsApp aktif

### QR Code tidak muncul

**Solusi:**
1. Pastikan terminal mendukung output QR (gunakan terminal bawaan OS)
2. Refresh dengan menjalankan bot kembali
3. Cek koneksi internet

### "Device logged out"

**Solusi:**
```bash
# Hapus sessions folder
rm -rf sessions/

# Jalankan kembali
npm start

# Scan QR Code lagi
```

### Error: ENOENT: no such file or directory

**Solusi:** Pastikan semua file sudah ada, terutama `src/commands/menu.js`

```bash
# Cek struktur
ls -la src/
ls -la src/commands/
```

### Command tidak terdeteksi

**Solusi:**
1. Cek apakah file command di `src/commands/`
2. Pastikan file berakhir dengan `.js`
3. Pastikan export default dengan struktur yang benar
4. Restart bot

## 📚 Resource Lebih Lanjut

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [Node.js Documentation](https://nodejs.org/docs/)
- [WhatsApp Web](https://web.whatsapp.com/)

## ⚠️ Disclaimer

- **Jangan gunakan untuk spam atau hal ilegal**
- **WhatsApp dapat memblokir nomor yang mencurigakan**
- **Gunakan dengan bijak dan bertanggung jawab**
- **Backup nomor WhatsApp Anda sebelum menggunakan bot**

## 📝 Lisensi

MIT License - Bebas digunakan, dimodifikasi, dan didistribusikan

---

**Made with ❤️ by Andre**

Jika ada pertanyaan atau error, silakan buat issue di GitHub.
