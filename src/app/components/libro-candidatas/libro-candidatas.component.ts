import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FfsjSpinnerComponent } from 'ffsj-web-components';
import { CookieService } from 'ngx-cookie-service';
import { CandidataData } from '../../model/candidata-data.model';
import { CandidataService } from '../../services/candidatas.service';
import { Asociacion } from '../../services/external-api/external-api';
import { InfoShowTable } from '../admin/admin.component';
import { ListadoComponent } from './listado/listado.component';

@Component({
  selector: 'app-libro-candidatas',
  standalone: true,
  imports: [
    CommonModule,
    ListadoComponent,
    FfsjSpinnerComponent
  ],
  templateUrl: './libro-candidatas.component.html',
  styleUrl: './libro-candidatas.component.scss'
})
export class LibroCandidatasComponent {

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

  constructor(
    private candidataService: CandidataService,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.loadData();
  }

  async loadData() {
    try {

      const candidatas = await this.candidataService.getCandidatas();
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

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.loading = false;
    }
  }

}
