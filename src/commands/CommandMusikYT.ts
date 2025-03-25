import { Message, MessageMedia } from "whatsapp-web.js";
import Command from "./Command";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

export class CommandMusikYT extends Command {
    constructor() {
        super("ytmp3", "Download lagu dari YouTube dalam format MP3", ["ytimportmp3"]);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        if (args.length < 1) {
            msg.reply("❌ Mohon masukkan judul lagu atau link YouTube!");
            return;
        }

        const query = args.join(" ");
        let youtubeUrl = query;

        if (!youtubeUrl.includes("youtube.com")) {
            youtubeUrl = `https://www.youtube.com/watch?v=${query}`;
        }
        const options = {
            method: 'GET',
            url: 'https://youtube-search-download3.p.rapidapi.com/v1/download',
            params: {
                v: youtubeUrl, 
                type: 'mp3'
            },
            headers: {
                'x-rapidapi-key': '8f222d3771msh505e9fbb564029fp17ce37jsn343153fe2d32', 
                'x-rapidapi-host': 'youtube-search-download3.p.rapidapi.com'
            }
        };
        try {
            const response = await axios.request(options);
            if (response.data.url) {
                const mp3Url = response.data.url;
                const filePath = path.join(__dirname, 'temp.mp3'); 

                const writer = fs.createWriteStream(filePath);
                const download = await axios({
                    url: mp3Url,
                    method: 'GET',
                    responseType: 'stream'
                });
                download.data.pipe(writer);

                writer.on('finish', async () => {
                    const media = MessageMedia.fromFilePath(filePath);
                    await msg.reply(media);
                    fs.unlinkSync(filePath);
                });

                writer.on('error', (err) => {
                    console.error("Download error:", err);
                    msg.reply("❌ Terjadi kesalahan saat mengunduh lagu.");
                });
            } else {
                msg.reply("❌ Gagal mendapatkan link MP3.");
            }
        } catch (error) {
            console.error(error);
            msg.reply("❌ Terjadi kesalahan saat mengunduh lagu.");
        }
    }
}
