import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
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
    MatSelectModule,
    MatCheckboxModule
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

  // 🔍 filtros de texto
  searchFilterAdultas = '';
  searchFilterInfantiles = '';

  // 🎯 filtro de tipo (Todos, Pendiente, informacionPersonal, vidaEnFogueres, ...)
  selectedFilterAdultas: string = '';
  selectedFilterInfantiles: string = '';

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

      // 🔎 PREDICATE ADULTAS
      this.adultasDataSource.filterPredicate = (
        data: InfoShowTable,
        filter: string
      ) => {
        let parsed: any = {};
        try {
          parsed = filter ? JSON.parse(filter) : {};
        } catch {
          parsed = {};
        }

        const text: string = (parsed.text || '').trim().toLowerCase();
        const filterType: string = parsed.filterType || '';

        // 1) Filtro de texto
        const matchesText =
          !text ||
          Object.values(data).some((v) =>
            (v ?? '').toString().toLowerCase().includes(text)
          );

        // 2) Filtro de “Filtros”
        const keysToCheck = this.columnasAdultas.slice(2); // ej: ['informacionPersonal','vidaEnFogueres',...]
        const isAllComplete = keysToCheck.every(
          (key) => (data as any)[key] === 'Completo'
        );

        let matchesFilterType = true;

        switch (filterType) {
          case '':
            // "Todos": no filtra por completado
            matchesFilterType = true;
            break;

          case 'pendiente':
            // “Pendiente”: al menos 1 sección distinta de 'Completo'
            matchesFilterType = !isAllComplete;
            break;

          case 'todo':
            // “Todo completo”: todas las secciones en 'Completo'
            matchesFilterType = isAllComplete;
            break;

          default:
            // Una sección concreta: solo mostrar si ESA está completa
            matchesFilterType = (data as any)[filterType] === 'Completo';
            break;
        }

        return matchesText && matchesFilterType;
      };

      // 🔎 PREDICATE INFANTILES
      this.infantilesDataSource.filterPredicate = (
        data: InfoShowTable,
        filter: string
      ) => {
        let parsed: any = {};
        try {
          parsed = filter ? JSON.parse(filter) : {};
        } catch {
          parsed = {};
        }

        const text: string = (parsed.text || '').trim().toLowerCase();
        const filterType: string = parsed.filterType || '';

        const matchesText =
          !text ||
          Object.values(data).some((v) =>
            (v ?? '').toString().toLowerCase().includes(text)
          );

        const keysToCheck = this.columnasInfantiles.slice(2);
        const isAllComplete = keysToCheck.every(
          (key) => (data as any)[key] === 'Completo'
        );

        let matchesFilterType = true;

        switch (filterType) {
          case '':
            matchesFilterType = true;
            break;

          case 'pendiente':
            matchesFilterType = !isAllComplete;
            break;

          case 'todo':
            matchesFilterType = isAllComplete;
            break;

          default:
            matchesFilterType = (data as any)[filterType] === 'Completo';
            break;
        }

        return matchesText && matchesFilterType;
      };

      // Inicializa filtros vacíos
      this.updateFilters('adultas');
      this.updateFilters('infantiles');

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

  private updateFilters(tipo: TableKey) {
    if (tipo === 'adultas') {
      const filterObj = {
        text: this.searchFilterAdultas,
        filterType: this.selectedFilterAdultas,
      };
      this.adultasDataSource.filter = JSON.stringify(filterObj);
      if (this.adultasDataSource.paginator) {
        this.adultasDataSource.paginator.firstPage();
      }
    } else {
      const filterObj = {
        text: this.searchFilterInfantiles,
        filterType: this.selectedFilterInfantiles,
      };
      this.infantilesDataSource.filter = JSON.stringify(filterObj);
      if (this.infantilesDataSource.paginator) {
        this.infantilesDataSource.paginator.firstPage();
      }
    }
  }

  applyFilter(filterValue: string, tipo: TableKey) {
    const value = (filterValue || '').trim().toLowerCase();

    if (tipo === 'adultas') {
      this.searchFilterAdultas = value;
    } else {
      this.searchFilterInfantiles = value;
    }

    this.updateFilters(tipo);
  }

  onFilterChange(value: string, tipo: TableKey) {
    if (tipo === 'adultas') {
      this.selectedFilterAdultas = value;
    } else {
      this.selectedFilterInfantiles = value;
    }

    this.updateFilters(tipo);
  }


}
