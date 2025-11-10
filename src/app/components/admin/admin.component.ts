import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CandidataData, LabelsFormulario } from '../../model/candidata-data.model';
import { Asociacion } from '../../services/external-api/external-api';
import { DialogOverviewComponent } from '../dialog-overview/dialog-overview.component';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FfsjAlertService } from 'ffsj-web-components';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { CandidataService } from '../../services/candidatas.service';

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
    MatMenuModule,
    MatPaginator,
    FormsModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
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

  adultasDataSource = new MatTableDataSource<InfoShowTable>([]);
  infantilesDataSource = new MatTableDataSource<InfoShowTable>([]);

  @ViewChild('paginatorAdultas') paginatorAdultas!: MatPaginator;
  @ViewChild('paginatorInfantiles') paginatorInfantiles!: MatPaginator;

  columnasAdultas: string[] = [];
  columnasInfantiles: string[] = [];
  columnasAdultasText: string[] = [];
  columnasInfantilesText: string[] = [];

  selectedTab: string = 'adultas';

  constructor(
    public dialog: MatDialog,
    private ffsjAlertService: FfsjAlertService,
    private candidataService: CandidataService
  ) {

  }

  ngOnInit() {
    this.loading = true;
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (this.paginatorAdultas) this.adultasDataSource.paginator = this.paginatorAdultas;
    if (this.paginatorInfantiles) this.infantilesDataSource.paginator = this.paginatorInfantiles;
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

      this.adultasDataSource.data = this.adultasData;
      this.infantilesDataSource.data = this.infantilesData;
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.loading = false;
    }
  }

  openDialog(element: any, col?: string, j?: number): void {
    const datos = (j && col) ? element[j][col] : element;
    this.dialog.open(DialogOverviewComponent, {
      data: { datos, asociaciones: this.asociaciones, visorDocumentos: col?.includes('documentacion') },
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

  editElement(element: any) {
    console.log(element);
    this.ffsjAlertService.warning('Esta funcionalidad no está disponible de momento.');
  }

  applyFilter(filterValue: string, tipo: 'adultas' | 'infantiles') {
    const value = (filterValue || '').trim().toLowerCase();
    if (tipo === 'adultas') {
      this.adultasDataSource.filter = value;
      if (this.paginatorAdultas) this.paginatorAdultas.firstPage();
    } else {
      this.infantilesDataSource.filter = value;
      if (this.paginatorInfantiles) this.paginatorInfantiles.firstPage();
    }
  }

}
