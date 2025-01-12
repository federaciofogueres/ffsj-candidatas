import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'ffsj-web-components';
import { CandidataService } from '../../services/candidatas.service';
import { CensoService } from '../../services/censo.service';
import { Asociado } from '../../services/external-api/asociado';
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
    protected router: Router
  ) { }

  ngOnInit() {
    this.checkAdmin();
    this.loadAsociadoData();
  }

  checkAdmin() {
    const cargos = this.authService.getCargos();
    console.log({ cargos });
    this.esAdmin = Boolean(this.authService.getCargos().find(cargo => { return cargo.idCargo === 16 }));
    this.esJurado = Boolean(this.authService.getCargos().find(cargo => { return cargo.idCargo === 21 || cargo.idCargo === 22 }));

  }
  logout() {
    this.authService.logout();
  }

  onCambioVisor(event: any) {
    this.visor = event;
  }

  loadAsociadoData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.censoService.asociadosGetById(this.candidataService.getIdUsuario()).subscribe({
        next: (response: any) => {
          if (response.status.status === 200) {
            this.asociado = response.asociados[0];
            resolve();
          } else {
            reject('Error: Status not 200');
          }
        },
        error: (err) => reject(err)
      });
    });
  }

}
