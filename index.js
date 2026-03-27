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
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SANSAR</title>
        <style>
            :root {
                --primary: #2980b9;
                --secondary: #2c3e50;
                --accent: #27ae60;
                --bg: #ecf0f1;
                --text: #34495e;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: var(--bg);
                color: var(--text);
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
            }
            header {
                background-color: var(--secondary);
                color: white;
                width: 100%;
                padding: 1rem 0;
                text-align: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            header img {
                max-width: 120px;
                height: auto;
                margin-bottom: 0.5rem;
                border-radius: 8px;
            }
            .container {
                max-width: 800px;
                margin: 2rem auto;
                padding: 2rem;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                text-align: center;
                width: 90%;
            }
            h1 {
                color: var(--primary);
                margin-bottom: 1rem;
            }
            .btn-group {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-top: 2rem;
            }
            @media (min-width: 600px) {
                .btn-group {
                    flex-direction: row;
                    justify-content: center;
                }
            }
            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 12px 24px;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
                cursor: pointer;
                color: white;
            }
            .btn-bot {
                background-color: var(--primary);
            }
            .btn-bot:hover {
                background-color: #1a6091;
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            .btn-group-chat {
                background-color: var(--accent);
            }
            .btn-group-chat:hover {
                background-color: #1e8449;
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            .icon {
                margin-right: 10px;
                width: 24px;
                height: 24px;
            }
            footer {
                margin-top: auto;
                width: 100%;
                background-color: var(--secondary);
                color: white;
                text-align: center;
                padding: 1rem 0;
                font-size: 0.9rem;
            }
        </style>
    </head>
    <body>
        <header>
            <img src="logo.jpg" alt="SANSAR Logo">
            <h2>SANSAR</h2>
        </header>
        <div class="container">
            <h1>SANSAR</h1>
            <div class="btn-group">
                <a href="https://t.me/sansarsohbett" class="btn btn-group-chat" target="_blank">
                    <img src="https://telegram.org/img/t_logo.png" alt="Telegram Icon" class="icon">
                    Gruba Katıl
                </a>
                <a href="https://t.me/sansarmp3_bot" class="btn btn-bot" target="_blank">
                    <img src="https://telegram.org/img/t_logo.png" alt="Bot Icon" class="icon">
                    Botu Başlat
                </a>
            </div>
        </div>
        <footer>
            <p>Geliştirici: Deniz Efe | SANSAR © 2026</p>
        </footer>
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
          bot.editMessageText('Hiçbir modül bu videoyu indiremedi. Kısıtlamalı olabilir.', { chat_id: chatId, message_id: statusMsg.message_id });
          return;
        }
      }
    }

    if (stream) {
      bot.editMessageText('İşlem yapılıyor, az kaldı... 🚀', { chat_id: chatId, message_id: statusMsg.message_id });
      
      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);

      writeStream.on('finish', async () => {
        await bot.sendAudio(chatId, filePath);
        fs.unlinkSync(filePath);
        bot.deleteMessage(chatId, statusMsg.message_id);
      });

      writeStream.on('error', (err) => {
        bot.editMessageText('İşlem sırasında bir sorun oluştu.', { chat_id: chatId, message_id: statusMsg.message_id });
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
  } else {
    bot.sendMessage(chatId, 'Lütfen geçerli bir YouTube linki (video veya shorts) gönder.');
  }
});
