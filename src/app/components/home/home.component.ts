import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'ffsj-web-components';
import { CookieService } from 'ngx-cookie-service';
import { FfsjAlertService } from '../../../lib/ffsj-web-components';
import { CandidataService } from '../../services/candidatas.service';
import { CensoService } from '../../services/censo.service';
import { Asociado } from '../../services/external-api/asociado';
import { UsuarioService } from '../../services/usuario.service';
import { FormularioComponent } from '../formulario/formulario.component';

export type VisorType = 'formulario' | 'documentacion' | 'menu';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormularioComponent,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  public visor: VisorType = 'menu';
  public asociado!: Asociado;

  protected esAdmin: boolean = false;
  protected esJurado: boolean = false;

  constructor(
    private censoService: CensoService,
    private candidataService: CandidataService,
    private authService: AuthService,
    protected router: Router,
    private cookieService: CookieService,
    private usuarioService: UsuarioService,
    private ffsjAlertService: FfsjAlertService
  ) { }

  ngOnInit() {
    this.checkAdmin();
    this.loadAsociadoData();
  }

  checkAdmin() {
    const cargos = this.authService.getCargos();
    console.log({ cargos });
    this.esAdmin = Boolean(this.authService.getCargos().find(cargo => { return cargo.idCargo === 16 || cargo.idCargo === 17 }));

    let juradoAdulto = Boolean(cargos.find(cargo => { return cargo.idCargo === 21 }));
    let juradoInfantil = Boolean(cargos.find(cargo => { return cargo.idCargo === 22 }));
    this.esJurado = juradoAdulto || juradoInfantil;

    this.cookieService.set('juradoAdulto', juradoAdulto.toString())
    this.cookieService.set('juradoInfantil', juradoInfantil.toString())
  }
  logout() {
    this.authService.logout();
    localStorage.clear();
    this.cookieService.deleteAll();
  }

  onCambioVisor(event: any) {
    this.visor = event;
  }

  loadAsociadoData(): Promise<void> {
    return this.usuarioService.getAsociadoActual()
      .then((asociado) => {
        this.asociado = asociado;
      })
      .catch((error) => {
        this.ffsjAlertService.danger(error);
      });
  }
}
