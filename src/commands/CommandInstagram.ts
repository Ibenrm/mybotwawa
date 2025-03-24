import { Message } from "whatsapp-web.js";
import Command from "./Command";
import axios from "axios";

export class CommandInstagram extends Command {
    constructor() {
        super('igmp4', 'Mendownload Video dari Instagram', ['igdownload']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        if (args.length < 1) {
            msg.reply('❌ Mohon masukkan link Instagram!');
            return;
        }

        const instagramUrl = args.join(" ");
        const options = {
            method: 'GET',
            url: 'https://instagram-downloader-scraper-reels-igtv-posts-stories.p.rapidapi.com/scraper',
            params: { url: instagramUrl },
            headers: {
                'x-rapidapi-key': '8f222d3771msh505e9fbb564029fp17ce37jsn343153fe2d32',
                'x-rapidapi-host': 'instagram-downloader-scraper-reels-igtv-posts-stories.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(options);

            if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                const data = response.data.data[0]; 
                const mediaUrl = data?.media; 

                if (mediaUrl) {
                    msg.reply(`Link Download: ${mediaUrl}`);
                } else {
                    msg.reply("❌ Tidak ditemukan media untuk link Instagram ini.");
                }
            } else {
                msg.reply("❌ Tidak ada data yang ditemukan.");
            }
        } catch (error) {
            console.error("Terjadi kesalahan:", error);
            msg.reply("❌ Terjadi kesalahan yang tidak terduga.");
        }
    }
}
