declare module 'midtrans-client' {
    export class CoreApi {
        constructor(config: { isProduction: boolean; serverKey: string; clientKey?: string });
        charge(payload: any): Promise<any>;
    }

    export class Snap {
        constructor(config: { isProduction: boolean; serverKey: string });
        createTransaction(payload: any): Promise<any>;
    }
}