import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CandidataData, TiposCampos } from '../../model/candidata-data.model';
import { CensoService } from '../../services/censo.service';
import { Asociacion, ResponseAsociaciones } from '../../services/external-api/external-api';
import { FirebaseStorageService } from '../../services/storage.service';
import { DialogOverviewComponent } from '../dialog-overview/dialog-overview.component';

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
    MatTabsModule,
    MatDialogModule
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
    private censoService: CensoService,
    public dialog: MatDialog
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
          id: { value: dataBD['id'], required: true },
          informacionPersonal: {
            dni: { value: dataBD['dni'], required: true },
            nombre: { value: dataBD['nombre'], required: true },
            fechaNacimiento: { value: dataBD['fechaNacimiento'], required: true },
            ciudad: { value: dataBD['ciudad'], required: true },
            email: { value: dataBD['email'], required: true },
            telefono: { value: dataBD['telefono'], required: true },
            edad: { value: dataBD['edad'], required: true },
            tipoCandidata: { value: dataBD['tipoCandidata'], required: true }
          },
          vidaEnFogueres: {
            asociacion: { value: dataBD['asociacion'], required: true },
            anyosFiesta: { value: dataBD['anyosFiesta'], required: true },
            curriculum: { value: dataBD['curriculum'], required: true }
          },
          academico: {
            formacion: { value: dataBD['formacion'], required: true },
            situacionLaboral: { value: dataBD['situacionLaboral'], required: false },
            observaciones: { value: dataBD['observaciones'], required: false },
            aficiones: { value: dataBD['aficiones'], required: false }
          },
          documentacion: {
            autorizacionFoguera: { value: dataBD['autorizacionFoguera'], required: true },
            compromisoDisponibilidad: { value: dataBD['compromisoDisponibilidad'], required: true },
            derechosAutor: { value: dataBD['derechosAutor'], required: true },
            dniEscaneado: { value: dataBD['dniEscaneado'], required: true },
            fotoBelleza: { value: dataBD['fotoBelleza'], required: true },
            fotoCalle: { value: dataBD['fotoCalle'], required: true }
          },
          responsables: {
            nombreTutor1: { value: dataBD['nombreTutor1'], required: false },
            nombreTutor2: { value: dataBD['nombreTutor2'], required: false },
            telefonoTutor1: { value: dataBD['telefonoTutor1'], required: false },
            telefonoTutor2: { value: dataBD['telefonoTutor2'], required: false }
          }
        };
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
    array.sort((a, b) => a.vidaEnFogueres.asociacion.value.localeCompare(b.vidaEnFogueres.asociacion.value))
    array.forEach(c => {
      let info: InfoShowTable = {
        id: c.id.value,
        foguera: this.asociaciones.find(asociacion => { return c.vidaEnFogueres.asociacion.value === String(asociacion.id) })?.nombre || 'Sin datos',
        informacionPersonal: this.checkCampos(c.informacionPersonal) ? 'Completo' : 'Faltan datos',
        vidaEnFogueres: this.checkCampos(c.vidaEnFogueres) ? 'Completo' : 'Faltan datos',
        academico: this.checkCampos(c.academico) ? 'Completo' : 'Faltan datos',
        documentacion: this.checkCampos(c.documentacion) ? 'Completo' : 'Faltan datos',
        responsables: this.checkCampos(c.responsables) ? 'Completo' : 'Faltan datos'
      }
      infoTabla.push(info);
    })
    return { nuevasColumnasText, nuevasColumnas, infoTabla };
  }

  checkCampos(campos: TiposCampos): boolean {
    return Object.values(campos).every(campo => {
      if (campo.required) {
        return campo.value !== null && campo.value !== undefined && String(campo.value).trim() !== '';
      }
      return true;
    });
  }

  openDialog(element: any, col: string, j: number): void {
    this.dialog.open(DialogOverviewComponent, {
      data: { datos: element[j][col], asociaciones: this.asociaciones },
      width: '80%',
      height: '80%'
    });
  }

}
