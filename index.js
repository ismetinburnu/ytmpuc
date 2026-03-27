const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const fs = require('fs');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot aktif ve calisiyor');
});

app.listen(port, () => {});

const token = '7948701483:AAHigsr8ZYGJkwnVGDm424M1RvPz9uNiYBk';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Merhaba! Bana bir YouTube linki gönder, sana MP3 olarak geri göndereyim.');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text === '/start') return;

  const ytRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;

  if (ytRegex.test(text)) {
    bot.sendMessage(chatId, 'Ses dosyası indiriliyor, lütfen biraz bekle...');

    try {
      const info = await ytdl.getInfo(text);
      const title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, '');
      const filePath = `${title}.mp3`;

      const stream = ytdl(text, { filter: 'audioonly', quality: 'highestaudio' });

      stream.pipe(fs.createWriteStream(filePath))
        .on('finish', async () => {
          await bot.sendAudio(chatId, filePath);
          fs.unlinkSync(filePath);
        })
        .on('error', (err) => {
          bot.sendMessage(chatId, 'İndirme sırasında bir sorun oluştu.');
        });
    } catch (error) {
      bot.sendMessage(chatId, 'Geçersiz link veya video kısıtlamalı olabilir.');
    }
  } else {
    bot.sendMessage(chatId, 'Lütfen geçerli bir YouTube linki gönder.');
  }
});
