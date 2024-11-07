import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CandidataData } from '../../model/candidata-data.model';
import { CensoService } from '../../services/censo.service';
import { Asociacion, ResponseAsociaciones } from '../../services/external-api/external-api';
import { FirebaseStorageService } from '../../services/storage.service';

export interface InfoShowTable {
  id: string;
  foguera: string;
  informacionPersonal: string;
  vidaEnFogueres: string;
  academico: string;
  documentacion: string;
  responsables?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {

  Object = Object;

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
    private firebaseStorageService: FirebaseStorageService,
    private censoService: CensoService
  ) {

  }

  ngOnInit() {
    this.loading = true;
    this.loadData();
  }

  loadAsociaciones() {
    this.censoService.asociacionesGet().subscribe({
      next: (response: ResponseAsociaciones) => {
        if (response.status?.status === 200) {
          this.asociaciones = response.asociaciones || [];
        }
      }
    })
  }

  async loadFromBD(collection: string): Promise<CandidataData[]> {
    let arrayData: CandidataData[] = [];
    try {
      const data = await this.firebaseStorageService.getCollection(collection);
      data.forEach(dataBD => {
        let candidata: CandidataData = {
          id: dataBD['id'],
          dni: dataBD['dni'],
          nombre: dataBD['nombre'],
          fechaNacimiento: dataBD['fechaNacimiento'],
          formacion: dataBD['formacion'],
          situacionLaboral: dataBD['situacionLaboral'],
          curriculum: dataBD['curriculum'],
          anyosFiesta: dataBD['anyosFiesta'],
          edad: dataBD['edad'],
          ciudad: dataBD['ciudad'],
          email: dataBD['email'],
          telefono: dataBD['telefono'],
          observaciones: dataBD['observaciones'],
          asociacion: dataBD['asociacion'],
          tipoCandidata: dataBD['tipoCandidata'],
          aficiones: dataBD['aficiones'],
          autorizacionFoguera: dataBD['autorizacionFoguera'],
          compromisoDisponibilidad: dataBD['compromisoDisponibilidad'],
          derechosAutor: dataBD['derechosAutor'],
          dniEscaneado: dataBD['dniEscaneado'],
          fotoBelleza: dataBD['fotoBelleza'],
          fotoCalle: dataBD['fotoCalle'],
          nombreTutor1: dataBD['nombreTutor1'],
          nombreTutor2: dataBD['nombreTutor2'],
          telefonoTutor1: dataBD['telefonoTutor1'],
          telefonoTutor2: dataBD['telefonoTutor2'],
        }
        arrayData.push(candidata);
      });
    } catch (error) {
      console.error('Error obteniendo datos:', error);
    }
    return arrayData;
  }

  async loadData() {
    this.loadAsociaciones();
    this.adultas = await this.loadFromBD('candidatas/2024/adultas');
    this.infantiles = await this.loadFromBD('candidatas/2024/infantiles');

    ({ nuevasColumnasText: this.columnasAdultasText, nuevasColumnas: this.columnasAdultas, infoTabla: this.adultasData } = this.agrupaColumnas('adultas', this.adultas));
    ({ nuevasColumnasText: this.columnasInfantilesText, nuevasColumnas: this.columnasInfantiles, infoTabla: this.infantilesData } = this.agrupaColumnas('infantiles', this.infantiles));

    console.log(this.adultasData, this.infantilesData);
    this.loading = false;

  }

  agrupaColumnas(tipoCandidata: string, array: CandidataData[]) {
    let nuevasColumnas = ['id', 'foguera', 'informacionPersonal', 'vidaEnFogueres', 'academico', 'documentacion'];
    let nuevasColumnasText = ['Id', 'Foguera', 'Información Personal', 'Vida en Fogueres', 'Académico', 'Documentación'];
    if (tipoCandidata === 'infantiles') {
      nuevasColumnas.push('responsables');
      nuevasColumnasText.push('Responsables');
    }
    let infoTabla: any[] = [];
    array.sort((a, b) => a.asociacion.localeCompare(b.asociacion))
    array.forEach(c => {
      let info: InfoShowTable = {
        id: c.id,
        foguera: this.asociaciones.find(asociacion => { return c.asociacion === String(asociacion.id) })?.nombre || 'Sin datos',
        informacionPersonal: this.checkCampos([c.dni, c.nombre, c.fechaNacimiento, c.ciudad, c.telefono, c.email, c.tipoCandidata]) ? 'Completo' : 'Faltan datos',
        vidaEnFogueres: this.checkCampos([c.asociacion, c.anyosFiesta, c.curriculum]) ? 'Completo' : 'Faltan datos',
        academico: this.checkCampos([c.formacion, c.situacionLaboral, c.observaciones, c.aficiones]) ? 'Completo' : 'Faltan datos',
        documentacion: this.checkCampos([c.autorizacionFoguera, c.compromisoDisponibilidad, c.derechosAutor, c.dniEscaneado, c.fotoBelleza, c.fotoCalle]) ? 'Completo' : 'Faltan datos',
        responsables: this.checkCampos([c.nombreTutor1, c.nombreTutor2, c.telefonoTutor1, c.telefonoTutor2]) ? 'Completo' : 'Faltan datos'
      }
      infoTabla.push(info);
    })
    return { nuevasColumnasText, nuevasColumnas, infoTabla };
  }

  checkCampos(campos: string[]): boolean {
    return Boolean(campos.filter(campo => Boolean(campo)));
  }

}
