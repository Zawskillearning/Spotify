const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const port = process.env.PORT || 3000;
const { search } = require("@nechlophomeriaa/spotifydl");

const bot = new Telegraf("7089554191:AAFd2Xi2sCXiH_fBeriIow9qca5SxKMmuJE"); // Add here your bot token

let userState = {};

////////////////////// Start Command //////////////////////

bot.command("start", async (ctx) => {
  const welcomeMessage =
    '<b>Wᴇʟᴄᴏᴍᴇ Tᴏ Sᴘᴏᴛɪғʏ Mᴜsɪᴄ ᴠ2</b>\n\n<b>ɪ Cᴀɴ Dᴏᴡɴʟᴏᴀᴅ Sᴇɴᴅ Yᴏᴜ Aᴜᴅɪᴏ Fɪʟᴇ.\n\nJᴜsᴛ Sᴇɴᴅ Mᴇ Sᴘᴏᴛɪғʏ Sᴏɴɢ Uʀʟ Lɪᴋᴇ Tʜɪs</b> <pre> /download {track_link}</pre>\n <b>Oʀ Usᴇ Tʜᴇ</b> <pre>/search {song_name}</pre>\n\n<b>Fᴏʀ Mᴏʀᴇ Iɴғᴏᴍᴀᴛɪᴏɴ Usᴇ Tʜᴇ</b> /help ᴄᴏᴍᴍᴀɴᴅ\n\n<b>🥷 Dᴇᴠᴇʟᴏᴘᴇᴅ Bʏ @Yagami_x4light</b>';

  const gifUrl = "https://i.ibb.co/KDFRB23/file-57.jpg";

  try {
    await ctx.replyWithPhoto(gifUrl, {
      caption: welcomeMessage,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Error sending welcome message:", error);
    await ctx.reply(welcomeMessage);
  }
});

bot.command("help", async (ctx) => {
  const helpMessage =
    "<b>Hᴏᴡ Tᴏ Usᴇ ☟︎︎︎</b>\n\n<b>🔍 Sᴇᴀʀᴄʜ Aɴᴅ Dᴏᴡɴʟᴏᴀᴅ</b>\nYᴏᴜ ᴄᴀɴ ᴅɪʀᴇᴄᴛʟʏ sᴇᴀʀᴄʜ ᴀɴᴅ ᴅᴏᴡɴʟᴏᴀᴅ ғʀᴏᴍ sᴘᴏᴛɪғʏ ʙʏ ᴜsɪɴɢ /search ᴄᴏᴍᴍᴀɴᴅ ᴀɴᴅ sᴇʟᴇᴄᴛɪɴɢ ʏᴏᴜʀ sᴏɴɢ.\n\n<i>Example:\n</i><pre>/search feded</pre>\n\n<b>🎧 Dɪʀᴇᴄᴛʟʏ ᴅᴏᴡɴʟᴏᴀᴅ ʙʏ sᴏɴɢ URL</b>\n🚀 Yᴏᴜ ᴄᴀɴ ᴅɪʀᴇᴄᴛʟʏ ᴅᴏᴡɴʟᴏᴀᴅ ғʀᴏᴍ sᴘᴏᴛɪғʏ ʙʏ ᴜsɪɴɢ\n /download command.\n\n<i>Example:</i>\n<pre>/download https://open.spotify.com/track/71XxylHoSigwo354LSy5p6?si=fa0b9772252b4ca0</pre>\n\n<b>🎧 𝐄𝐧𝐣𝐨𝐲 𝐋𝐢𝐬𝐭𝐞𝐧𝐢𝐧𝐠...</b>";

  await ctx.reply(helpMessage, {
    parse_mode: "HTML",
  });
});

////////////////////// Search Command //////////////////////

const getInlineKeyboard = (currentPage, totalPages, isSelected) => {
  const buttons = [];

  if (isSelected) {
    buttons.push(Markup.button.callback("⚙️ Pʀᴏᴄᴇssɪɴɢ...", "none"));
  } else {
    if (currentPage > 0) {
      buttons.push(
        Markup.button.callback("⬅️ Backward", `backward:${currentPage}`),
      );
    }

    buttons.push(
      Markup.button.callback(
        `🎧 Select (${currentPage + 1}/${totalPages + 1})`,
        `select:${currentPage}`,
      ),
    );

    if (currentPage < totalPages) {
      buttons.push(
        Markup.button.callback("➡️ Forward", `forward:${currentPage}`),
      );
    }
  }

  return Markup.inlineKeyboard([buttons]);
};

const updateMessage = async (
  ctx,
  searchResults,
  currentPage,
  isSelected = false,
) => {
  const track = searchResults[currentPage];
  const songName = track.name;
  const description = `Aʀᴛɪsᴛ: ${track.artists[0].name} - Aʟʙᴜᴍ: ${track.album.name}`;
  const image = track.album.images[1].url || "";
  const duration = `${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, "0")}`;
  const release = track.album.release_date || "";

  await ctx.editMessageText(
    `<b>Sᴏɴɢ:</b> ${songName}\n<b>Aʀᴛɪsᴛ:</b> ${track.artists[0].name}\n<b>Aʟʙᴜᴍ:</b> ${track.album.name}\n<b>Dᴜʀᴀᴛɪᴏɴ:</b> ${duration}\n<b>Rᴇʟᴇᴀsᴇ Dᴀᴛᴇ:</b> ${release}<a href="${track.album.images[0].url}">&#8205;</a>`,
    {
      parse_mode: "HTML",
      reply_markup: getInlineKeyboard(
        currentPage,
        searchResults.length - 1,
        isSelected,
      ).reply_markup,
    },
  );
};

bot.command("search", async (ctx) => {
  const query = ctx.message.text.split(" ").slice(1).join(" ");

  if (!query) {
    return ctx.reply("Please enter a valid query");
  }

  try {
    const searchTrack = await search(query, 10);
    let searchResults = searchTrack.items;

    if (searchResults.length === 0) {
      return ctx.reply("No results found");
    }

    const currentPage = 0;
    userState[ctx.from.id] = { searchResults, currentPage };

    const track = searchResults[currentPage];
    const songName = track.name;
    const description = `Aʀᴛɪsᴛ: ${track.artists[0].name} - Aʟʙᴜᴍ: ${track.album.name}`;
    const image = track.album.images[1].url || "";
    const duration = `${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, "0")}`;
    const release = track.album.release_date || "";

    await ctx.reply(
      `<b>Sᴏɴɢ:</b> ${songName}\n<b>Aʀᴛɪsᴛ:</b> ${track.artists[0].name}\n<b>Aʟʙᴜᴍ:</b> ${track.album.name}\n<b>Dᴜʀᴀᴛɪᴏɴ:</b> ${duration}\n<b>Rᴇʟᴇᴀsᴇ Dᴀᴛᴇ:</b> ${release}<a href="${track.album.images[0].url}">&#8205;</a>`,
      {
        parse_mode: "HTML",
        reply_markup: getInlineKeyboard(
          currentPage,
          searchResults.length - 1,
          false,
        ).reply_markup,
      },
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to search for tracks");
  }
});

bot.action(/^(forward|backward|select):(\d+)$/, async (ctx) => {
  const action = ctx.match[1];
  const currentPage = parseInt(ctx.match[2]);
  const userId = ctx.from.id;

  if (!userState[userId]) {
    return ctx.answerCbQuery("Session expired. Please search again.");
  }

  let { searchResults } = userState[userId];

  let newPage = currentPage;
  if (action === "forward") {
    newPage = Math.min(currentPage + 1, searchResults.length - 1);
  } else if (action === "backward") {
    newPage = Math.max(currentPage - 1, 0);
  }

  if (action === "select") {
    const selectedTrack = searchResults[currentPage];
    const spotifyUrl = selectedTrack.external_urls.spotify;
    userState[userId].selected = true;

    await updateMessage(ctx, searchResults, currentPage, true);
    await ctx.answerCbQuery("⬇️ Dᴏᴡɴʟᴏᴀᴅɪɴɢ, Pʟᴇᴀsᴇ Wᴀɪᴛ...");

    try {
      const data = new FormData();
      data.append("url", spotifyUrl);

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://spotisongdownloader.com/api/composer/spotify/swd.php",
        headers: {
          ...data.getHeaders(),
        },
        data: data,
      };

      const response = await axios.request(config);

      const downloadUrl = response.data.dlink;

      let songData = await axios.get(
        `https://spotifydownloaders.com/api/getSpotifyDetails?url=${spotifyUrl}`,
      );
      songData = songData.data;


      let songName = songData.tracks[0].name;
      let artistName = songData.tracks[0].artist;
      let albumArt = songData.preview.image;
      let songDuration = songData.tracks[0].duration / 1000;

      await ctx.telegram.sendChatAction(
        ctx.callbackQuery.from.id,
        "upload_audio",
      );

      try {
        await ctx.telegram.sendAudio(
          ctx.callbackQuery.from.id,
          {
            url: downloadUrl,
            filename: `${artistName} - ${songName}.mp3`,
            thumbnail: { url: albumArt, filename: "albumArt.jpg" },
          },
          {
            title: songName,
            performer: artistName,
            thumbnail: { url: albumArt, filename: "albumArt.jpg" },
            duration: songDuration,
          }
        );
      } catch (error) {
        await ctx.telegram.sendAudio(ctx.callbackQuery.from.id, { url: downloadUrl });
      }

      await ctx.deleteMessage();
    } catch (error) {
      console.error("Error processing download:", error);
      await ctx.telegram.sendMessage(
        ctx.callbackQuery.from.id,
        "Failed to download and send audio.",
      );
    }

    return;
  }

  userState[userId].currentPage = newPage;
  await updateMessage(ctx, searchResults, newPage);
});

////////////////////// Download Command //////////////////////

bot.command("download", async (ctx) => {
  const spotifyUrl = ctx.message.text.split(" ").slice(1).join(" ").trim();

  if (!spotifyUrl.startsWith("https://open.spotify.com/track/")) {
    const errorMessage = await ctx.reply(
      "❌ Pʟᴇᴀsᴇ Eɴᴛᴇʀ ᴀ Vᴀʟɪᴅ Sᴘᴏᴛɪғʏ Sᴏɴɢ Uʀʟ, Sᴛᴀʀᴛɪɴɢ Wɪᴛʜ 'https://open.spotify.com/track/'.\n\n⏳ Tʜɪs Mᴇssᴀɢᴇ Wɪʟʟ Bᴇ Aᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ Dᴇʟᴇᴛᴇᴅ Iɴ 10 Sᴇᴄᴏɴᴅs...",
    );

    setTimeout(async () => {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, errorMessage.message_id);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }, 10000);

    return;
  }

  try {
    const processingMessage = await ctx.reply("⚙️ Pʀᴏᴄᴇssɪɴɢ...");

    const data = new FormData();
    data.append("url", spotifyUrl);

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://spotisongdownloader.com/api/composer/spotify/swd.php",
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    const response = await axios.request(config);

    const downloadUrl = response.data.dlink;

    let songData = await axios.get(
      `https://spotifydownloaders.com/api/getSpotifyDetails?url=${spotifyUrl}`,
    );
    songData = songData.data;

    let songName = songData.tracks[0].name;
    let artistName = songData.tracks[0].artist;
    let albumArt = songData.preview.image;
    let songDuration = songData.tracks[0].duration / 1000;

    await ctx.telegram.sendChatAction(ctx.from.id, "upload_audio");

    try {
      await ctx.telegram.sendAudio(
        ctx.from.id,
        {
          url: downloadUrl,
          filename: `${artistName} - ${songName}.mp3`,
          thumbnail: { url: albumArt, filename: "albumArt.jpg" },
        },
        {
          title: songName,
          performer: artistName,
          thumbnail: { url: albumArt, filename: "albumArt.jpg" },
          duration: songDuration,
        },
      );
    } catch (error) {
      await ctx.telegram.sendAudio(ctx.callbackQuery.from.id, { url: downloadUrl });
    }

    await ctx.telegram.deleteMessage(ctx.from.id, processingMessage.message_id);
  } catch (error) {
    console.error("Error processing download:", error);
    await ctx.reply("Failed to download and send audio.");
  }
});

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

bot.launch();

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});

