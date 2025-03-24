import { Message, MessageMedia } from "whatsapp-web.js";
import Command from "./Command";
import midtransClient from "midtrans-client";
import axios from "axios";

export class CommandPay extends Command {

    constructor() {
        super('bayar', 'ini adalah command bayar', ['pay']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        if (args.length < 2) {
            msg.reply("Gunakan format: *bayar (qris/bni/bri/mandiri) (nominal)*\n\nContoh: *bayar qris 20000* atau *bayar bni 50000*");
            return;
        }

        const method = args[0].toLowerCase();
        const amount = args[1] && !isNaN(Number(args[1])) ? Number(args[1]) : 50000;
        const orderId = `ORDER-${Math.floor(Math.random() * 1000000000)}`;

        msg.reply("🔄 Sedang memproses pembayaran...");

        let paymentResult;

        switch (method) {
            case 'qris':
                paymentResult = await this.createQrisTransaction(orderId, amount);
                if (paymentResult?.error) {
                    msg.reply(`⚠️ ${paymentResult.error}`);
                } else {
                    const qrImage = await this.fetchQRImage(paymentResult.qr_url);
                    if (qrImage) {
                        const media = new MessageMedia("image/png", qrImage.toString("base64"));
                        await msg.reply(media, undefined, { caption: `✅ Scan QRIS ini untuk pembayaran.\n\n🆔 Order ID: *${orderId}*\n💰 Jumlah: Rp ${amount.toLocaleString("id-ID")}` });

                        // 🔄 Cek status pembayaran secara real-time
                        this.checkPaymentLoop(orderId, msg);
                    } else {
                        msg.reply(`⚠️ Gagal mengambil gambar QR Code. Silakan scan manual: ${paymentResult.qr_url}`);
                    }
                }
                break;

            case 'bni':
            case 'bri':
            case 'mandiri':
                paymentResult = await this.createVaTransaction(orderId, amount, method);
                if (paymentResult?.error) {
                    msg.reply(`⚠️ ${paymentResult.error}`);
                } else {
                    msg.reply(`✅ Pembayaran berhasil dibuat!\n\n🆔 Order ID: *${orderId}*\n🏦 Bank: *${method.toUpperCase()}*\n🔢 VA Number: *${paymentResult.va_number}*\n💰 Jumlah: Rp ${amount.toLocaleString("id-ID")}`);

                    // 🔄 Cek status pembayaran secara real-time
                    this.checkPaymentLoop(orderId, msg);
                }
                break;

            default:
                msg.reply("⚠️ Metode pembayaran tidak ditemukan.\nGunakan: *bayar (qris/bni/bri/mandiri) (nominal)*");
                break;
        }
    }

    private async createQrisTransaction(orderId: string, amount: number): Promise<any> {
        try {
            let coreApi = new midtransClient.CoreApi({
                isProduction: false,
                serverKey: "SB-Mid-server-TB0ao1klCyHPp7CnUltQaR6L",
                clientKey: "SB-Mid-client-PUr68CS9Tsl15mRF"
            });

            const response = await coreApi.charge({
                payment_type: "gopay", // QRIS pakai metode Gopay
                transaction_details: { order_id: orderId, gross_amount: amount },
                gopay: { enable_callback: false, callback_url: "" }
            });

            if (!response.actions || !Array.isArray(response.actions)) {
                return { error: "Terjadi kesalahan dalam mendapatkan QR Code." };
            }

            const qrAction = response.actions.find((a: any) => a.name === "generate-qr-code");
            if (!qrAction) {
                return { error: "QR Code tidak tersedia, coba metode lain." };
            }

            return { qr_url: qrAction.url };

        } catch (error: any) {
            return this.extractMidtransError(error);
        }
    }

    private async createVaTransaction(orderId: string, amount: number, bank: string): Promise<any> {
        try {
            let coreApi = new midtransClient.CoreApi({
                isProduction: false,
                serverKey: "SB-Mid-server-TB0ao1klCyHPp7CnUltQaR6L",
                clientKey: "SB-Mid-client-PUr68CS9Tsl15mRF"
            });

            const response = await coreApi.charge({
                payment_type: "bank_transfer",
                transaction_details: { order_id: orderId, gross_amount: amount },
                bank_transfer: { bank: bank }
            });

            return { va_number: response.va_numbers?.[0]?.va_number || "VA tidak ditemukan" };

        } catch (error: any) {
            return this.extractMidtransError(error);
        }
    }

    private async fetchQRImage(qrUrl: string): Promise<Buffer | null> {
        try {
            const response = await axios.get(qrUrl, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        } catch (error) {
            return null;
        }
    }

    private async checkPaymentLoop(orderId: string, msg: Message): Promise<void> {
        let isPaid = false;
    
        while (!isPaid) {
            try {
                const response = await axios.get(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
                    headers: {
                        "Authorization": "Basic " + Buffer.from("SB-Mid-server-TB0ao1klCyHPp7CnUltQaR6L").toString("base64"),
                        "Content-Type": "application/json"
                    }
                });
    
                const status = response.data.transaction_status;
    
                if (status === "settlement") {
                    msg.reply(`✅ *Pembayaran Berhasil!* 🎉\n\n🆔 Order ID: ${orderId}\n💰 Jumlah: Rp ${response.data.gross_amount}`);
                    isPaid = true;
                    break;
                } else if (status === "expire" || status === "cancel") {
                    msg.reply(`❌ *Pembayaran Gagal!* 😞\n\nStatus: ${status.toUpperCase()}\n🆔 Order ID: ${orderId}`);
                    isPaid = true;
                    break;
                }
    
                //Tunggu 10 detik sebelum cek lagi
                await new Promise(resolve => setTimeout(resolve, 10000));
    
            } catch (error: any) {
                msg.reply("⚠️ Gagal mengecek status pembayaran.");
                break;
            }
        }
    }
    

    private extractMidtransError(error: any): { error: string } {
        if (error.response?.data) {
            const midtransError = error.response.data;
            if (midtransError.status_code === "402") {
                return { error: "Metode pembayaran ini belum aktif di Midtrans. Silakan hubungi admin." };
            }
            return { error: `Error Midtrans: ${midtransError.status_message || "Terjadi kesalahan"}` };
        }
        return { error: "Terjadi kesalahan saat menghubungi Midtrans." };
    }
}
