import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, FfsjAlertService, FfsjLoginComponent } from 'ffsj-web-components';
import { jwtDecode } from "jwt-decode";
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs';
import { FirebaseStorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FfsjLoginComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(
    private router: Router,
    private ffsjAlertService: FfsjAlertService,
    private authService: AuthService,
    private cookiesService: CookieService,
    private firebaseStorageService: FirebaseStorageService,
    private http: HttpClient
  ) { }

  manageLogin(event: any) {
    console.log('Login event:', event);
    if (event) {
      console.log('Login successful');

      let token = this.authService.getToken();
      this.getIdUsuario(token);
      this.setTokenConfigurations(token);
      this.router.navigateByUrl('/home');
      this.ffsjAlertService.success('¡Bienvenid@!')
      this.saveDeviceInfo();
    } else {
      console.log('Login failed');
      this.ffsjAlertService.danger('Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo o contacta con transformaciondigital@hogueras.es.')
    }
  }

  getIdUsuario(token: string) {
    const decodedToken: any = jwtDecode(token);
    this.cookiesService.set('idUsuario', decodedToken.id);
    return decodedToken.id;
  }

  setTokenConfigurations(token: string) {
  }

  private saveDeviceInfo() {
    this.http.get<{ ip: string }>('https://api.ipify.org?format=json')
      .pipe(
        map(response => response.ip)
      )
      .subscribe(ip => {
        const deviceInfo = this.getDeviceInfo();
        const userId = this.authService.getIdUsuario();
        this.firebaseStorageService.addDevideConnection(userId.toString(), ip, deviceInfo);
      });
  }

  private getDeviceInfo(): string {
    const userAgent = window.navigator.userAgent;
    return userAgent;
  }

}
