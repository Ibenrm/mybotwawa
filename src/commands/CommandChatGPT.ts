import { Message } from "whatsapp-web.js";
import Command from "./Command";
import { OpenAI } from "openai";
import axios from "axios";

const client = new OpenAI({
    apiKey: "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", // Ganti dengan API Key kamu
});

export class CommandChatGPT extends Command {
    constructor() {
        super('ask', 'Ini adalah command say', ['tanya']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        if (args.length < 1) {
            msg.reply('Mohon masukkan pertanyaan!');
            return;
        }

        const question = args.join(' ');

        const options = {
            method: 'POST',
            url: 'https://chat-gpt26.p.rapidapi.com/',
            headers: {
              'x-rapidapi-key': '8f222d3771msh505e9fbb564029fp17ce37jsn343153fe2d32',
              'x-rapidapi-host': 'chat-gpt26.p.rapidapi.com',
              'Content-Type': 'application/json'
            },
            data: {
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'user',
                  content: question
                }
              ]
            }
          };
        
        async function fetchData() {
            try {
                const response = await axios.request(options);
                const message = response.data.choices[0].message.content;
                msg.reply(message); 
            } catch (error) {
                console.error(error);
                msg.reply("Terjadi kesalahan saat mendapatkan jawaban.");
            }
        }
        
        fetchData();
    }
}
