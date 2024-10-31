import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcryptjs';
import * as i0 from "@angular/core";
export class EncoderService {
    constructor() {
        this.key = 'eFfFsJ2023*';
        this.iv = CryptoJS.enc.Utf8.parse('1234567890123456');
        this.key = 'eFfFsJ2023*';
        this.iv = CryptoJS.enc.Utf8.parse('1234567890123456');
    }
    encryptPassword(data) {
        const saltRounds = 10;
        let salt = bcrypt.genSaltSync(saltRounds);
        let encodedPassword = bcrypt.hashSync(data, salt);
        return encodedPassword;
    }
    checkPassword(password, encrypted) {
        return bcrypt.compareSync(password, encrypted);
    }
    // Método para encriptar datos de entrada
    encrypt(password) {
        const encrypted = CryptoJS.AES.encrypt(password, this.key, { iv: this.iv });
        return encrypted.toString();
    }
    // Método para desencriptar datos de entrada
    decrypt(passwordToDecrypt) {
        const decrypted = CryptoJS.AES.decrypt(passwordToDecrypt, this.key, { iv: this.iv });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: EncoderService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: EncoderService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: EncoderService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2Rlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZmZzai13ZWItY29tcG9uZW50cy9zcmMvbGliL2Zmc2otbG9naW4vc2VydmljZXMvZW5jb2Rlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxLQUFLLFFBQVEsTUFBTSxXQUFXLENBQUM7QUFDdEMsT0FBTyxLQUFLLE1BQU0sTUFBTSxVQUFVLENBQUM7O0FBSW5DLE1BQU0sT0FBTyxjQUFjO0lBS3pCO1FBSFEsUUFBRyxHQUFHLGFBQWEsQ0FBQztRQUNwQixPQUFFLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFHdkQsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUM7UUFDekIsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsZUFBZSxDQUFDLElBQVk7UUFDMUIsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUMsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEQsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQztJQUVELGFBQWEsQ0FBQyxRQUFnQixFQUFFLFNBQWlCO1FBQy9DLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELHlDQUF5QztJQUNsQyxPQUFPLENBQUMsUUFBZ0I7UUFDN0IsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsT0FBTyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVELDRDQUE0QztJQUNyQyxPQUFPLENBQUMsaUJBQXlCO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckYsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQzsrR0EvQlUsY0FBYzttSEFBZCxjQUFjLGNBRmIsTUFBTTs7NEZBRVAsY0FBYztrQkFIMUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCAqIGFzIENyeXB0b0pTIGZyb20gJ2NyeXB0by1qcyc7XHJcbmltcG9ydCAqIGFzIGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuZXhwb3J0IGNsYXNzIEVuY29kZXJTZXJ2aWNlIHtcclxuXHJcbiAgcHJpdmF0ZSBrZXkgPSAnZUZmRnNKMjAyMyonO1xyXG4gIHByaXZhdGUgaXYgPSBDcnlwdG9KUy5lbmMuVXRmOC5wYXJzZSgnMTIzNDU2Nzg5MDEyMzQ1NicpO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMua2V5ID0gJ2VGZkZzSjIwMjMqJztcclxuICAgIHRoaXMuaXYgPSBDcnlwdG9KUy5lbmMuVXRmOC5wYXJzZSgnMTIzNDU2Nzg5MDEyMzQ1NicpO1xyXG4gIH1cclxuXHJcbiAgZW5jcnlwdFBhc3N3b3JkKGRhdGE6IHN0cmluZykge1xyXG4gICAgY29uc3Qgc2FsdFJvdW5kcyA9IDEwO1xyXG4gICAgbGV0IHNhbHQgPSBiY3J5cHQuZ2VuU2FsdFN5bmMoc2FsdFJvdW5kcyk7XHJcbiAgICBsZXQgZW5jb2RlZFBhc3N3b3JkID0gYmNyeXB0Lmhhc2hTeW5jKGRhdGEsIHNhbHQpO1xyXG4gICAgcmV0dXJuIGVuY29kZWRQYXNzd29yZDtcclxuICB9XHJcblxyXG4gIGNoZWNrUGFzc3dvcmQocGFzc3dvcmQ6IHN0cmluZywgZW5jcnlwdGVkOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiBiY3J5cHQuY29tcGFyZVN5bmMocGFzc3dvcmQsIGVuY3J5cHRlZCk7XHJcbiAgfVxyXG5cclxuICAvLyBNw6l0b2RvIHBhcmEgZW5jcmlwdGFyIGRhdG9zIGRlIGVudHJhZGFcclxuICBwdWJsaWMgZW5jcnlwdChwYXNzd29yZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGVuY3J5cHRlZCA9IENyeXB0b0pTLkFFUy5lbmNyeXB0KHBhc3N3b3JkLCB0aGlzLmtleSwgeyBpdjogdGhpcy5pdiB9KTtcclxuICAgIHJldHVybiBlbmNyeXB0ZWQudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIC8vIE3DqXRvZG8gcGFyYSBkZXNlbmNyaXB0YXIgZGF0b3MgZGUgZW50cmFkYVxyXG4gIHB1YmxpYyBkZWNyeXB0KHBhc3N3b3JkVG9EZWNyeXB0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgZGVjcnlwdGVkID0gQ3J5cHRvSlMuQUVTLmRlY3J5cHQocGFzc3dvcmRUb0RlY3J5cHQsIHRoaXMua2V5LCB7IGl2OiB0aGlzLml2IH0pO1xyXG4gICAgcmV0dXJuIGRlY3J5cHRlZC50b1N0cmluZyhDcnlwdG9KUy5lbmMuVXRmOCk7XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=