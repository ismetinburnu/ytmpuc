const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const express = require('express');
const ytdl = require('ytdl-core');
const distube = require('@distube/ytdl-core');
const playdl = require('play-dl');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr" data-theme="light">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SANSAR</title>
        <link href="https://cdn.jsdelivr.net/npm/daisyui@4.7.2/dist/full.min.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background: linear-gradient(135deg, #4f46e5, #ec4899, #8b5cf6);
                background-size: 400% 400%;
                animation: gradientBG 15s ease infinite;
            }
            @keyframes gradientBG {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .glass-panel {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
            }
            .blob {
                position: absolute;
                filter: blur(70px);
                z-index: 0;
                opacity: 0.7;
                animation: float 10s infinite ease-in-out alternate;
            }
            @keyframes float {
                0% { transform: translateY(0px) scale(1); }
                100% { transform: translateY(-40px) scale(1.1); }
            }
        </style>
    </head>
    <body class="min-h-screen flex items-center justify-center p-5 relative">
        <div class="blob bg-purple-400 w-72 h-72 rounded-full top-10 left-10"></div>
        <div class="blob bg-pink-400 w-72 h-72 rounded-full bottom-10 right-10" style="animation-delay: 2s;"></div>
        <div class="blob bg-indigo-400 w-72 h-72 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="animation-delay: 4s;"></div>

        <div class="glass-panel relative z-10 w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center text-center">
            <div class="avatar mb-6">
                <div class="w-32 rounded-3xl shadow-2xl ring ring-white/40 ring-offset-base-100 ring-offset-2">
                    <img src="logo.jpg" alt="SANSAR Logo" />
                </div>
            </div>
            
            <h1 class="text-4xl font-extrabold text-white mb-8 tracking-wider drop-shadow-lg">SANSAR</h1>
            
            <div class="w-full flex flex-col gap-5">
                <a href="https://t.me/sansarsohbett" class="btn glass w-full h-16 rounded-2xl text-white text-lg font-semibold border-white/40 hover:bg-white/30 hover:border-white/70 hover:scale-105 transition-all duration-300">
                    <i class='bx bxl-telegram text-3xl mr-2'></i>
                    Gruba Katıl
                </a>
                <a href="https://t.me/sansarmp3_bot" class="btn glass w-full h-16 rounded-2xl text-white text-lg font-semibold border-white/40 hover:bg-white/30 hover:border-white/70 hover:scale-105 transition-all duration-300">
                    <i class='bx bx-bot text-3xl mr-2'></i>
                    Botu Başlat
                </a>
            </div>

            <p class="mt-10 text-white/80 text-sm font-medium tracking-wide">Geliştirici: Deniz Efe | SANSAR © 2026</p>
        </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {});

const token = '8723309637:AAGmEdIg9aTjl8aSNLYPaEMHxleTE6Ioj60';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Merhaba! Ben SANSAR için özel geliştirilmiş botum.\n\nBir YouTube linki (Shorts dahil) gönder ve şarkıyı hemen indireyim.\nKomutları görmek için /yardim yazabilirsin.');
});

bot.onText(/\/yardim/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Kullanabileceğin komutlar:\n\n/start - Botu başlatır\n/yardim - Bu menüyü gösterir\n/dev - Geliştirici bilgileri\n\nSadece bir YouTube linki göndermen yeterli, arka planda 3 farklı sistemle indirmeyi denerim.');
});

bot.onText(/\/dev/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Bu bot Deniz Efe tarafından geliştirilmiştir. 👑');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|shorts\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = text.match(ytRegex);

  if (match) {
    const videoId = match[1];
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const filePath = `${videoId}.mp3`;
    
    let statusMsg = await bot.sendMessage(chatId, 'Ses dosyası aranıyor, lütfen bekle... ⏳');

    let stream;
    
    try {
      stream = distube(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
    } catch (err1) {
      try {
        stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
      } catch (err2) {
        try {
          const playInfo = await playdl.stream(videoUrl);
          stream = playInfo.stream;
        } catch (err3) {
          bot.editMessageText('Hiçbir modül bu videoyu indiremedi. Kısıtlamalı olabilir.', { chat_id: chatId, message_id: statusMsg.message_id }).catch(()=>{});
          return;
        }
      }
    }

    if (stream) {
      bot.editMessageText('İşlem yapılıyor, az kaldı... 🚀', { chat_id: chatId, message_id: statusMsg.message_id }).catch(()=>{});
      
      const writeStream = fs.createWriteStream(filePath);
      
      stream.on('error', (err) => {
        bot.editMessageText('YouTube bağlantıyı kesti veya hız çok yavaş. Lütfen tekrar dene.', { chat_id: chatId, message_id: statusMsg.message_id }).catch(()=>{});
        writeStream.end();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      stream.pipe(writeStream);

      writeStream.on('finish', async () => {
        try {
          await bot.sendAudio(chatId, filePath);
          bot.deleteMessage(chatId, statusMsg.message_id).catch(()=>{});
        } catch (sendErr) {
          bot.editMessageText('Dosya Telegrama yüklenirken hata oluştu (Dosya boyutu çok büyük olabilir).', { chat_id: chatId, message_id: statusMsg.message_id }).catch(()=>{});
        } finally {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });

      writeStream.on('error', (err) => {
        bot.editMessageText('Dosya işlenirken bir sorun oluştu.', { chat_id: chatId, message_id: statusMsg.message_id }).catch(()=>{});
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
  } else {
    bot.sendMessage(chatId, 'Lütfen geçerli bir YouTube linki (video veya shorts) gönder.');
  }
});
