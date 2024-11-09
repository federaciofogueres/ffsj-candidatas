import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CandidataData, LabelsFormulario, TiposCampos } from '../../model/candidata-data.model';
import { CensoService } from '../../services/censo.service';
import { Asociacion, ResponseAsociaciones } from '../../services/external-api/external-api';
import { FirebaseStorageService } from '../../services/storage.service';
import { DialogOverviewComponent } from '../dialog-overview/dialog-overview.component';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export interface InfoShowTable {
  id: string;
  foguera: string;
  informacionPersonal: string;
  vidaEnFogueres: string;
  academico: string;
  documentacion: string;
  responsables?: string;
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatDialogModule,
    MatMenuModule
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

  selectedTab: string = 'adultas';

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

    this.updateAsociacionValues(this.adultas, this.adultasData);
    this.updateAsociacionValues(this.infantiles, this.adultasData);

    console.log(this.adultasData, this.infantilesData);
    this.loading = false;
  }

  updateAsociacionValues(data: CandidataData[], adultasData: InfoShowTable[]): void {
    data.forEach((item, index) => {
      const correspondingAdulta = adultasData.find(adulta => adulta.id === item.id.value);
      if (correspondingAdulta) {
        item.vidaEnFogueres.asociacion.value = correspondingAdulta.foguera;
      }
    });
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
      data: { datos: element[j][col], asociaciones: this.asociaciones, visorDocumentos: col.includes('documentacion') },
      width: '80%',
      height: '80%'
    });
  }

  download(option?: keyof CandidataData): void {
    const data = this.selectedTab === 'adultas' ? this.adultas : this.infantiles;
    let workbook: XLSX.WorkBook = { Sheets: {}, SheetNames: [] };

    if (option) {
      this.addSheetToWorkbook(workbook, data, option);
    } else {
      const keys = Object.keys(data[0]).filter(key => key !== 'id') as (keyof CandidataData)[];
      keys.forEach(key => {
        this.addSheetToWorkbook(workbook, data, key);
      });
    }

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, `candidatas_${option || 'todo'}`);
  }

  addSheetToWorkbook(workbook: XLSX.WorkBook, data: CandidataData[], key: keyof CandidataData): void {
    const exportData = this.getExportData(data, key);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.sheet_add_aoa(worksheet, [this.getHeaders(key)], { origin: 'A1' });
    const label = LabelsFormulario[key as string] || key as string
    workbook.Sheets[label] = worksheet;
    workbook.SheetNames.push(label);
  }

  getExportData(data: CandidataData[], key: keyof CandidataData): any[] {
    return data.map((item: CandidataData) => {
      const flattened = this.flattenObject(item[key]);
      flattened['ID'] = item.id?.value || '';
      flattened['Asociación'] = item.vidaEnFogueres?.asociacion?.value || '';
      return flattened;
    });
  }

  getHeaders(key: keyof CandidataData): string[] {
    const headers = ['ID'];
    if (key !== 'vidaEnFogueres') {
      headers.push('Asociación');
    }
    const obj = (this.selectedTab === 'adultas' ? this.adultas : this.infantiles)[0][key];
    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        headers.push(LabelsFormulario[k] || k);
      }
    }
    return headers;
  }

  flattenObject(obj: any, parent: string = '', res: any = {}): any {
    res['ID'] = '';
    if (!('asociacion' in obj)) {
      res['Asociación'] = '';
    }
    for (let key in obj) {
      const propName = parent ? `${parent}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && 'value' in obj[key]) {
        res[propName] = obj[key].value;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.flattenObject(obj[key], propName, res);
      } else {
        res[propName] = obj[key];
      }
    }
    return res;
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
  }

  onTabChange(event: any): void {
    this.selectedTab = event.index === 0 ? 'adultas' : 'infantiles';
  }

}
