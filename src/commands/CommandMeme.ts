import { Message, MessageMedia } from "whatsapp-web.js";
import Command from "./Command";
import axios from "axios";

export class CommandMeme extends Command {
    
    constructor() {
        super('meme', 'Mengirimkan meme random dari Reddit', ['meme2']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        try {
            // Fetch meme dari API meme-api.com
            const response = await axios.get("https://meme-api.com/gimme");
            const memeUrl = response.data.url;
            const media = await MessageMedia.fromUrl(memeUrl);
            msg.reply(media);

        } catch (error) {
            console.error("❌ Error fetching meme:", error);
            msg.reply("❌ Terjadi kesalahan saat mengambil meme.");
        }
    }
}
