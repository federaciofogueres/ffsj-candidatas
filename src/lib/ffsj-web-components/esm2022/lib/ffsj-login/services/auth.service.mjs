import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
import * as i2 from "./censo.service";
import * as i3 from "./encoder.service";
import * as i4 from "ngx-cookie-service";
export class AuthService {
    constructor(router, censoService, encoderService, cookieService) {
        this.router = router;
        this.censoService = censoService;
        this.encoderService = encoderService;
        this.cookieService = cookieService;
        this.loginStatus$ = new BehaviorSubject(false);
        this.loginStatusObservable = this.loginStatus$.asObservable();
    }
    checkToken() {
        return !this.checkExpireDateToken(this.encoderService.decrypt(this.cookieService.get('token')));
    }
    checkExpireDateToken(token) {
        if (token === '' || token === null) {
            return true;
        }
        const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }
    isLocalDomain() {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }
    saveToken(token) {
        const isLocal = this.isLocalDomain();
        const hostName = isLocal ? undefined : '.hogueras.es';
        const options = {
            domain: hostName,
            path: '/',
            secure: !isLocal // Assuming secure cookies should not be set for localhost
        };
        this.cookieService.set('token', this.encoderService.encrypt(token), options);
    }
    async login(user, password) {
        let usuario = {
            user,
            password: this.encoderService.encrypt(password)
        };
        return new Promise(async (resolve, reject) => {
            this.censoService.doLogin(usuario).subscribe({
                next: (res) => {
                    if (res.solicitud) {
                        console.log('Cambiar password');
                        this.censoService.configuration.accessToken = res.solicitud.token;
                        // this.saveToken(res.solicitud.token!);
                        resolve({ code: 201, id: res.solicitud.id });
                    }
                    else {
                        console.log(res);
                        this.saveToken(res.token);
                        resolve({ code: 200 });
                    }
                    console.log(res);
                    this.saveToken(res.token);
                    this.loginStatus$.next(true);
                    resolve(res);
                },
                error: (error) => {
                    console.log(error);
                    this.loginStatus$.next(false);
                    reject({ code: 400 });
                }
            });
        });
    }
    getToken() {
        let token = '';
        if (this.cookieService.get('token')) {
            token = this.encoderService.decrypt(this.cookieService.get('token'));
            this.loginStatus$.next(true);
        }
        return token;
    }
    getIdUsuario() {
        const token = this.getToken();
        if (token === '' || token === null) {
            return -1;
        }
        return (JSON.parse(atob(token.split('.')[1]))).id;
    }
    logout() {
        this.cookieService.delete('token');
        this.router.navigateByUrl('login');
        this.loginStatus$.next(false);
    }
    isLoggedIn() {
        const token = this.cookieService.get('token');
        const isLoggedIn = token !== null && token !== '' ? this.checkToken() : false;
        this.loginStatus$.next(isLoggedIn);
        return isLoggedIn;
    }
    getCargos() {
        try {
            // Suponiendo que token es la cadena que quieres decodificar
            const token = this.cookieService.get('token');
            if (!token) {
                throw new Error('Token no encontrado');
            }
            // Asegúrate de que la cadena esté correctamente codificada en base64 antes de decodificarla
            const tokenDecoded = this.encoderService.decrypt(token);
            const base64Payload = tokenDecoded.split('.')[1]; // Asumiendo JWT. Ajusta según sea necesario.
            const payload = atob(base64Payload);
            // Procesa el payload como necesites
            return JSON.parse(payload).cargos; // Ajusta según la estructura de tus datos
        }
        catch (error) {
            // console.log('Error al decodificar la cadena base64:', error);
            // Retorna un valor de respaldo o maneja el error como consideres apropiado
            return [];
        }
    }
    updatePassword(asociado, password) {
        return new Promise((resolve, reject) => {
            this.censoService.asociadosGetById(asociado).subscribe({
                next: (res) => {
                    console.log(res);
                    let usuario = res.asociados[0];
                    usuario.password = this.encoderService.encrypt(password);
                    this.censoService.asociadosPut(usuario, usuario.id).subscribe({
                        next: (res) => {
                            console.log(res);
                            resolve(res); // Resuelve la promesa si la actualización es correcta
                        },
                        error: (error) => {
                            console.log(error);
                            reject(error); // Rechaza la promesa si hay un error en la actualización
                        }
                    });
                },
                error: (error) => {
                    console.log(error);
                    reject(error); // Rechaza la promesa si hay un error al obtener el usuario
                }
            });
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: AuthService, deps: [{ token: i1.Router }, { token: i2.CensoService }, { token: i3.EncoderService }, { token: i4.CookieService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: AuthService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: AuthService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.Router }, { type: i2.CensoService }, { type: i3.EncoderService }, { type: i4.CookieService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZmZzai13ZWItY29tcG9uZW50cy9zcmMvbGliL2Zmc2otbG9naW4vc2VydmljZXMvYXV0aC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7Ozs7O0FBUXZDLE1BQU0sT0FBTyxXQUFXO0lBS3RCLFlBQ1UsTUFBYyxFQUNkLFlBQTBCLEVBQzFCLGNBQThCLEVBQzlCLGFBQTRCO1FBSDVCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFDOUIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFQOUIsaUJBQVksR0FBRyxJQUFJLGVBQWUsQ0FBVSxLQUFLLENBQUMsQ0FBQztRQUMzRCwwQkFBcUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBT3JELENBQUM7SUFFTCxVQUFVO1FBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEcsQ0FBQztJQUVELG9CQUFvQixDQUFDLEtBQWE7UUFDaEMsSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNuQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMs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LENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2pCLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9CLE9BQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3pELElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDO3dCQUM1RCxJQUFJLEVBQUUsQ0FBQyxHQUFRLEVBQUUsRUFBRTs0QkFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFFakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsc0RBQXNEO3dCQUN0RSxDQUFDO3dCQUNELEtBQUssRUFBRSxDQUFDLEtBQVUsRUFBRSxFQUFFOzRCQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNuQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyx5REFBeUQ7d0JBQzFFLENBQUM7cUJBQ0YsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsS0FBSyxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUU7b0JBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLDJEQUEyRDtnQkFDNUUsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzsrR0FuSlUsV0FBVzttSEFBWCxXQUFXLGNBRlYsTUFBTTs7NEZBRVAsV0FBVztrQkFIdkIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XHJcbmltcG9ydCB7IENvb2tpZVNlcnZpY2UgfSBmcm9tICduZ3gtY29va2llLXNlcnZpY2UnO1xyXG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgVXN1YXJpbyB9IGZyb20gJy4uL2V4dGVybmFsLWFwaS91c3VhcmlvJztcclxuaW1wb3J0IHsgQ2Vuc29TZXJ2aWNlIH0gZnJvbSAnLi9jZW5zby5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRW5jb2RlclNlcnZpY2UgfSBmcm9tICcuL2VuY29kZXIuc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBdXRoU2VydmljZSB7XHJcblxyXG4gIHByaXZhdGUgbG9naW5TdGF0dXMkID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XHJcbiAgbG9naW5TdGF0dXNPYnNlcnZhYmxlID0gdGhpcy5sb2dpblN0YXR1cyQuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcclxuICAgIHByaXZhdGUgY2Vuc29TZXJ2aWNlOiBDZW5zb1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGVuY29kZXJTZXJ2aWNlOiBFbmNvZGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgY29va2llU2VydmljZTogQ29va2llU2VydmljZVxyXG4gICkgeyB9XHJcblxyXG4gIGNoZWNrVG9rZW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIXRoaXMuY2hlY2tFeHBpcmVEYXRlVG9rZW4odGhpcy5lbmNvZGVyU2VydmljZS5kZWNyeXB0KHRoaXMuY29va2llU2VydmljZS5nZXQoJ3Rva2VuJykhKSlcclxuICB9XHJcblxyXG4gIGNoZWNrRXhwaXJlRGF0ZVRva2VuKHRva2VuOiBzdHJpbmcpIHtcclxuICAgIGlmICh0b2tlbiA9PT0gJycgfHwgdG9rZW4gPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjb25zdCBleHBpcnkgPSAoSlNPTi5wYXJzZShhdG9iKHRva2VuLnNwbGl0KCcuJylbMV0pKSkuZXhwO1xyXG4gICAgcmV0dXJuIChNYXRoLmZsb29yKChuZXcgRGF0ZSkuZ2V0VGltZSgpIC8gMTAwMCkpID49IGV4cGlyeTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNMb2NhbERvbWFpbigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnIHx8IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gJzEyNy4wLjAuMSc7XHJcbiAgfVxyXG4gIFxyXG4gIHNhdmVUb2tlbih0b2tlbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBpc0xvY2FsID0gdGhpcy5pc0xvY2FsRG9tYWluKCk7XHJcbiAgICBjb25zdCBob3N0TmFtZSA9IGlzTG9jYWwgPyB1bmRlZmluZWQgOiAnLmhvZ3VlcmFzLmVzJztcclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIGRvbWFpbjogaG9zdE5hbWUsXHJcbiAgICAgIHBhdGg6ICcvJyxcclxuICAgICAgc2VjdXJlOiAhaXNMb2NhbCAvLyBBc3N1bWluZyBzZWN1cmUgY29va2llcyBzaG91bGQgbm90IGJlIHNldCBmb3IgbG9jYWxob3N0XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvb2tpZVNlcnZpY2Uuc2V0KCd0b2tlbicsIHRoaXMuZW5jb2RlclNlcnZpY2UuZW5jcnlwdCh0b2tlbiksIG9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgbG9naW4odXNlcjogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSB7XHJcbiAgICBsZXQgdXN1YXJpbzogVXN1YXJpbyA9IHtcclxuICAgICAgdXNlcixcclxuICAgICAgcGFzc3dvcmQ6IHRoaXMuZW5jb2RlclNlcnZpY2UuZW5jcnlwdChwYXNzd29yZClcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIHRoaXMuY2Vuc29TZXJ2aWNlLmRvTG9naW4odXN1YXJpbykuc3Vic2NyaWJlKHtcclxuICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcclxuICAgICAgICAgIGlmIChyZXMuc29saWNpdHVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYW1iaWFyIHBhc3N3b3JkJyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2Vuc29TZXJ2aWNlLmNvbmZpZ3VyYXRpb24uYWNjZXNzVG9rZW4gPSByZXMuc29saWNpdHVkLnRva2VuITtcclxuICAgICAgICAgICAgLy8gdGhpcy5zYXZlVG9rZW4ocmVzLnNvbGljaXR1ZC50b2tlbiEpO1xyXG4gICAgICAgICAgICByZXNvbHZlKHtjb2RlOiAyMDEsIGlkOiByZXMuc29saWNpdHVkLmlkfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgICAgICAgICB0aGlzLnNhdmVUb2tlbihyZXMudG9rZW4hKTtcclxuICAgICAgICAgICAgcmVzb2x2ZSh7Y29kZTogMjAwfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XHJcbiAgICAgICAgICB0aGlzLnNhdmVUb2tlbihyZXMudG9rZW4hKTtcclxuICAgICAgICAgIHRoaXMubG9naW5TdGF0dXMkLm5leHQodHJ1ZSk7XHJcbiAgICAgICAgICByZXNvbHZlKHJlcylcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yOiAoZXJyb3I6IGFueSkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgdGhpcy5sb2dpblN0YXR1cyQubmV4dChmYWxzZSk7XHJcbiAgICAgICAgICByZWplY3Qoe2NvZGU6IDQwMH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRUb2tlbigpIHtcclxuICAgIGxldCB0b2tlbiA9ICcnO1xyXG4gICAgaWYgKHRoaXMuY29va2llU2VydmljZS5nZXQoJ3Rva2VuJykpIHtcclxuICAgICAgdG9rZW4gPSB0aGlzLmVuY29kZXJTZXJ2aWNlLmRlY3J5cHQodGhpcy5jb29raWVTZXJ2aWNlLmdldCgndG9rZW4nKSEpO1xyXG4gICAgICB0aGlzLmxvZ2luU3RhdHVzJC5uZXh0KHRydWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRva2VuO1xyXG4gIH1cclxuXHJcbiAgZ2V0SWRVc3VhcmlvKCk6IG51bWJlciB7XHJcbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuZ2V0VG9rZW4oKTtcclxuICAgIGlmICh0b2tlbiA9PT0gJycgfHwgdG9rZW4gPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChKU09OLnBhcnNlKGF0b2IodG9rZW4uc3BsaXQoJy4nKVsxXSkpKS5pZDtcclxuICB9XHJcblxyXG4gIGxvZ291dCgpIHtcclxuICAgIHRoaXMuY29va2llU2VydmljZS5kZWxldGUoJ3Rva2VuJyk7XHJcbiAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZUJ5VXJsKCdsb2dpbicpO1xyXG4gICAgdGhpcy5sb2dpblN0YXR1cyQubmV4dChmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBpc0xvZ2dlZEluKCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgdG9rZW4gPSB0aGlzLmNvb2tpZVNlcnZpY2UuZ2V0KCd0b2tlbicpO1xyXG4gICAgY29uc3QgaXNMb2dnZWRJbiA9IHRva2VuICE9PSBudWxsICYmIHRva2VuICE9PSAnJyA/IHRoaXMuY2hlY2tUb2tlbigpIDogZmFsc2U7XHJcbiAgICB0aGlzLmxvZ2luU3RhdHVzJC5uZXh0KGlzTG9nZ2VkSW4pO1xyXG4gICAgcmV0dXJuIGlzTG9nZ2VkSW47XHJcbiAgfVxyXG5cclxuICBnZXRDYXJnb3MoKTogYW55W10ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gU3Vwb25pZW5kbyBxdWUgdG9rZW4gZXMgbGEgY2FkZW5hIHF1ZSBxdWllcmVzIGRlY29kaWZpY2FyXHJcbiAgICAgIGNvbnN0IHRva2VuID0gdGhpcy5jb29raWVTZXJ2aWNlLmdldCgndG9rZW4nKTtcclxuICAgICAgaWYgKCF0b2tlbikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVG9rZW4gbm8gZW5jb250cmFkbycpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEFzZWfDunJhdGUgZGUgcXVlIGxhIGNhZGVuYSBlc3TDqSBjb3JyZWN0YW1lbnRlIGNvZGlmaWNhZGEgZW4gYmFzZTY0IGFudGVzIGRlIGRlY29kaWZpY2FybGFcclxuICAgICAgY29uc3QgdG9rZW5EZWNvZGVkID0gdGhpcy5lbmNvZGVyU2VydmljZS5kZWNyeXB0KHRva2VuKTtcclxuICAgICAgY29uc3QgYmFzZTY0UGF5bG9hZCA9IHRva2VuRGVjb2RlZC5zcGxpdCgnLicpWzFdOyAvLyBBc3VtaWVuZG8gSldULiBBanVzdGEgc2Vnw7puIHNlYSBuZWNlc2FyaW8uXHJcbiAgICAgIGNvbnN0IHBheWxvYWQgPSBhdG9iKGJhc2U2NFBheWxvYWQpO1xyXG4gICAgICAvLyBQcm9jZXNhIGVsIHBheWxvYWQgY29tbyBuZWNlc2l0ZXNcclxuICAgICAgcmV0dXJuIEpTT04ucGFyc2UocGF5bG9hZCkuY2FyZ29zOyAvLyBBanVzdGEgc2Vnw7puIGxhIGVzdHJ1Y3R1cmEgZGUgdHVzIGRhdG9zXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAvLyBjb25zb2xlLmxvZygnRXJyb3IgYWwgZGVjb2RpZmljYXIgbGEgY2FkZW5hIGJhc2U2NDonLCBlcnJvcik7XHJcbiAgICAgIC8vIFJldG9ybmEgdW4gdmFsb3IgZGUgcmVzcGFsZG8gbyBtYW5lamEgZWwgZXJyb3IgY29tbyBjb25zaWRlcmVzIGFwcm9waWFkb1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHVwZGF0ZVBhc3N3b3JkKGFzb2NpYWRvOiBudW1iZXIsIHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgdGhpcy5jZW5zb1NlcnZpY2UuYXNvY2lhZG9zR2V0QnlJZChhc29jaWFkbykuc3Vic2NyaWJlKHtcclxuICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XHJcbiAgICAgICAgICBsZXQgdXN1YXJpbyA9IHJlcy5hc29jaWFkb3NbMF07XHJcbiAgICAgICAgICB1c3VhcmlvLnBhc3N3b3JkID0gdGhpcy5lbmNvZGVyU2VydmljZS5lbmNyeXB0KHBhc3N3b3JkKTtcclxuICAgICAgICAgIHRoaXMuY2Vuc29TZXJ2aWNlLmFzb2NpYWRvc1B1dCh1c3VhcmlvLCB1c3VhcmlvLmlkKS5zdWJzY3JpYmUoe1xyXG4gICAgICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xyXG5cclxuICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7IC8vIFJlc3VlbHZlIGxhIHByb21lc2Egc2kgbGEgYWN0dWFsaXphY2nDs24gZXMgY29ycmVjdGFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IChlcnJvcjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgIHJlamVjdChlcnJvcik7IC8vIFJlY2hhemEgbGEgcHJvbWVzYSBzaSBoYXkgdW4gZXJyb3IgZW4gbGEgYWN0dWFsaXphY2nDs25cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvcjogKGVycm9yOiBhbnkpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgIHJlamVjdChlcnJvcik7IC8vIFJlY2hhemEgbGEgcHJvbWVzYSBzaSBoYXkgdW4gZXJyb3IgYWwgb2J0ZW5lciBlbCB1c3VhcmlvXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbn1cclxuIl19