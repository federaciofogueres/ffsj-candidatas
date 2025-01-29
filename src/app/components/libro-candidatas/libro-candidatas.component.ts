import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FfsjSpinnerComponent } from 'ffsj-web-components';
import { CookieService } from 'ngx-cookie-service';
import { CandidataData } from '../../model/candidata-data.model';
import { CandidataService } from '../../services/candidatas.service';
import { Asociacion } from '../../services/external-api/external-api';
import { InfoShowTable } from '../admin/admin.component';
import { ListadoComponent } from './listado/listado.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-libro-candidatas',
  standalone: true,
  imports: [
    CommonModule,
    ListadoComponent,
    FfsjSpinnerComponent,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './libro-candidatas.component.html',
  styleUrl: './libro-candidatas.component.scss'
})
export class LibroCandidatasComponent {

  searchControl = new FormControl();
  
  candidatas: CandidataData[] = [];

  loading: boolean = true;

  asociaciones: Asociacion[] = [];

  adultas: CandidataData[] = [];
  infantiles: CandidataData[] = [];

  adultasData: InfoShowTable[] = [];
  infantilesData: InfoShowTable[] = [];

  columnasAdultas: string[] = [];
  columnasInfantiles: string[] = [];
  columnasAdultasText: string[] = [];
  columnasInfantilesText: string[] = [];

  candidatasToShow: CandidataData[] = [];

  constructor(
    private candidataService: CandidataService,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.loadData();
  }

  async loadData(forceReload: boolean = false) {
    try {

      const candidatas = await this.candidataService.getCandidatas(forceReload);
      this.infantiles = candidatas.infantiles;
      this.adultas = candidatas.adultas;
      this.adultasData = candidatas.adultasData;
      this.infantilesData = candidatas.infantilesData;
      this.columnasAdultas = candidatas.columnasAdultas;
      this.columnasInfantiles = candidatas.columnasInfantiles;
      this.columnasAdultasText = candidatas.columnasAdultasText;
      this.columnasInfantilesText = candidatas.columnasInfantilesText;
      
      if (this.cookieService.get('juradoAdulto') === 'true') {
        this.candidatas = this.adultas;
      } else if (this.cookieService.get('juradoInfantil') === 'true') {
        this.candidatas = this.infantiles
      } else {
        this.candidatas = [];
      }
      this.candidatasToShow = this.candidatas;

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.loading = false;
    }
  }

  filterItems(value: string | any) {
    value = (value.target as HTMLInputElement).value.toLowerCase();
    this.candidatasToShow = this.candidatas.filter(item => {
      const nombreCompleto = item.informacionPersonal.nombre.value ? item.informacionPersonal.nombre.value.toLowerCase() : '';
      const asociacion = item.vidaEnFogueres.asociacion_label.value ? item.vidaEnFogueres.asociacion_label.value.toLowerCase() : '';
      const numeroFoguera = item.vidaEnFogueres.asociacion_order.value ? item.vidaEnFogueres.asociacion_order.value : -1;
      return nombreCompleto.includes(value) || asociacion.includes(value) || numeroFoguera === value;
    });
  }

  onFabClick() {
    this.loading = true;
    this.loadData(true);
  }

}
