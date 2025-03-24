import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";
import commands from "./commands";

const client = new Client({
    restartOnAuthFail: true,
    webVersionCache: {
        type: "remote",
        remotePath:
          "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html",
      },
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process", 
          "--disable-gpu",
        ],
      },
      authStrategy: new LocalAuth(),
});

client.on('qr', async (qr) => {
    const smallQR = await qrcode.toString(qr, { type: 'terminal', small: true });
    console.log(smallQR);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    for (const command of commands){
        command.handle(msg);
    }
});

client.initialize();