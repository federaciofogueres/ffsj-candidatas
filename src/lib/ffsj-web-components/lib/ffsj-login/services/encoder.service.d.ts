import * as i0 from "@angular/core";
export declare class EncoderService {
    private key;
    private iv;
    constructor();
    encryptPassword(data: string): string;
    checkPassword(password: string, encrypted: string): boolean;
    encrypt(password: string): string;
    decrypt(passwordToDecrypt: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<EncoderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<EncoderService>;
}
