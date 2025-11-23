import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { FormsModule } from '@angular/forms';
import { FfsjAlertService } from 'ffsj-web-components';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { CandidataData, LabelsFormulario } from '../../model/candidata-data.model';
import { CandidataService } from '../../services/candidatas.service';
import { Asociacion } from '../../services/external-api/external-api';
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

type TableKey = 'adultas' | 'infantiles';

interface TableConfig {
  key: TableKey;
  label: string;
}

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

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
    MatPaginatorModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSortModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  Object = Object;

  loading = true;

  asociaciones: Asociacion[] = [];

  adultas: CandidataData[] = [];
  infantiles: CandidataData[] = [];

  adultasData: InfoShowTable[] = [];
  infantilesData: InfoShowTable[] = [];

  adultasDataSource = new MatTableDataSource<InfoShowTable>([]);
  infantilesDataSource = new MatTableDataSource<InfoShowTable>([]);

  // paginadores
  @ViewChild('paginatorAdultas')
  set paginatorAdultasSetter(paginator: MatPaginator) {
    if (paginator) {
      this.adultasDataSource.paginator = paginator;
    }
  }

  @ViewChild('paginatorInfantiles')
  set paginatorInfantilesSetter(paginator: MatPaginator) {
    if (paginator) {
      this.infantilesDataSource.paginator = paginator;
    }
  }

  // sorts
  @ViewChild('sortAdultas')
  set sortAdultasSetter(sort: MatSort) {
    if (sort) {
      this.adultasDataSource.sort = sort;
    }
  }

  @ViewChild('sortInfantiles')
  set sortInfantilesSetter(sort: MatSort) {
    if (sort) {
      this.infantilesDataSource.sort = sort;
    }
  }

  columnasAdultas: string[] = [];
  columnasInfantiles: string[] = [];
  columnasAdultasText: string[] = [];
  columnasInfantilesText: string[] = [];

  selectedTab: TableKey = 'adultas';

  // para el refactor del html
  tableConfigs: TableConfig[] = [
    { key: 'adultas', label: 'Adultas' },
    { key: 'infantiles', label: 'Infantiles' },
  ];

  constructor(
    public dialog: MatDialog,
    private ffsjAlertService: FfsjAlertService,
    private candidataService: CandidataService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.loadData();
  }

  async loadData() {
    try {
      const candidatas = await this.candidataService.getCandidatas(true);

      this.infantiles = candidatas.infantiles;
      this.adultas = candidatas.adultas;

      this.adultasData = candidatas.adultasData;
      this.infantilesData = candidatas.infantilesData;

      this.columnasAdultas = candidatas.columnasAdultas;
      this.columnasInfantiles = candidatas.columnasInfantiles;
      this.columnasAdultasText = candidatas.columnasAdultasText;
      this.columnasInfantilesText = candidatas.columnasInfantilesText;

      // ordenar por foguera
      this.adultasData.sort((a, b) =>
        (a.foguera || '').localeCompare(b.foguera || '', 'es', { sensitivity: 'base' })
      );
      this.infantilesData.sort((a, b) =>
        (a.foguera || '').localeCompare(b.foguera || '', 'es', { sensitivity: 'base' })
      );

      this.adultasDataSource.data = this.adultasData;
      this.infantilesDataSource.data = this.infantilesData;
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.loading = false;
    }
  }

  openDialog(tipo: TableKey, row: InfoShowTable, col: string): void {
    // 1. Elegir el array correcto de candidatas
    const dataArray = tipo === 'adultas' ? this.adultas : this.infantiles;

    // Ojo: InfoShowTable.id es string, CandidataData.id.value también (según tu modelo)
    const candidata = dataArray.find(c => c.id?.value?.toString() === row.id?.toString());

    if (!candidata) {
      console.error('No se encontró la candidata para la fila', row);
      return;
    }

    // 2. Sacar la parte del objeto que queremos mostrar (informacionPersonal, vidaEnFogueres, academico, documentacion, responsables...)
    const datos = (candidata as any)[col];

    if (!datos) {
      console.warn(`No se encontraron datos para la columna "${col}" en la candidata con id ${row.id}`);
    }

    // 3. Abrir el diálogo
    this.dialog.open(DialogOverviewComponent, {
      data: {
        datos,
        asociaciones: this.asociaciones,
        visorDocumentos: col.includes('documentacion'),
      },
      width: 'auto',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'dialog-auto-size',
    });
  }


  download(option?: keyof CandidataData): void {
    const data = this.selectedTab === 'adultas' ? this.adultas : this.infantiles;
    const workbook: XLSX.WorkBook = { Sheets: {}, SheetNames: [] };

    if (option) {
      this.addSheetToWorkbook(workbook, data, option);
    } else {
      const keys = Object.keys(data[0]).filter((key) => key !== 'id') as (keyof CandidataData)[];
      keys.forEach((key) => {
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
    const label = LabelsFormulario[key as string] || (key as string);
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
    for (const k in obj) {
      if (obj.hasOwnProperty(k)) {
        headers.push(LabelsFormulario[k] || k);
      }
    }
    return headers;
  }

  flattenObject(obj: any, parent = '', res: any = {}): any {
    res['ID'] = '';
    if (!('asociacion' in obj)) {
      res['Asociación'] = '';
    }
    for (const key in obj) {
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

  applyFilter(filterValue: string, tipo: TableKey) {
    const value = (filterValue || '').trim().toLowerCase();
    if (tipo === 'adultas') {
      this.adultasDataSource.filter = value;
      if (this.adultasDataSource.paginator) {
        this.adultasDataSource.paginator.firstPage();
      }
    } else {
      this.infantilesDataSource.filter = value;
      if (this.infantilesDataSource.paginator) {
        this.infantilesDataSource.paginator.firstPage();
      }
    }
  }
}
