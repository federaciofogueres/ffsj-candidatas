import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CandidataData, LabelsFormulario } from '../../model/candidata-data.model';
import { Asociacion } from '../../services/external-api/external-api';
import { DialogOverviewComponent } from '../dialog-overview/dialog-overview.component';

import { FfsjAlertService, FfsjSpinnerComponent } from 'ffsj-web-components';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { CandidataService } from '../../services/candidatas.service';

import jsPDF from 'jspdf';

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
    FfsjSpinnerComponent
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
    public dialog: MatDialog,
    private ffsjAlertService: FfsjAlertService,
    private candidataService: CandidataService
  ) {

  }

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

  async generarLibro(data: CandidataData[]) {
    const doc = new jsPDF();
    this.loading = true;

    for (let i = 0; i < data.length; i++) {
      const candidata = data[i];
      const pagina = await this.generarPagina(candidata, false);
      if (pagina) {
        if (i > 0) {
          doc.addPage();
        }
        doc.addImage(pagina, 'JPEG', 0, 0, 210, 297);
      }
    }

    this.loading = false;
    doc.save('Libro_Candidatas.pdf');
  }

  generarPagina(candidata: CandidataData, descarga: boolean = true): Promise<string | void> {
    return new Promise((resolve) => {
      const doc = new jsPDF();
      let linea = 10;

      // Añadir nombre y número de orden
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(196, 20, 28);
      doc.text(this.capitalizeFirstLetter(candidata.informacionPersonal.nombre.value), 10, linea);
      doc.setTextColor(196, 20, 28);
      doc.text(candidata.vidaEnFogueres.asociacion_order.value.toString(), 200, linea, { align: 'right' });

      linea += 5;

      // Añadir línea horizontal
      doc.setDrawColor(227, 116, 28); // Naranja
      doc.line(10, linea, 200, linea);

      linea += 5;

      // Añadir asociación
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Negro
      doc.text(this.capitalizeFirstLetter(candidata.vidaEnFogueres.asociacion_label.value), 10, linea);

      linea += 10;

      // Añadir imágenes
      const addImages = () => {
        if (candidata.documentacion.fotoBelleza.value) {
          const img1 = new Image();
          img1.src = candidata.documentacion.fotoBelleza.value;
          img1.onload = () => {
            doc.addImage(img1, 'JPEG', 10, linea, 90, 120);
            if (candidata.documentacion.fotoCalle.value) {
              const img2 = new Image();
              img2.src = candidata.documentacion.fotoCalle.value;
              img2.onload = () => {
                doc.addImage(img2, 'JPEG', 110, linea, 90, 120);
                addText();
              };
            } else {
              addText();
            }
          };
        } else if (candidata.documentacion.fotoCalle.value) {
          const img2 = new Image();
          img2.src = candidata.documentacion.fotoCalle.value;
          img2.onload = () => {
            doc.addImage(img2, 'JPEG', 110, linea, 90, 120);
            addText();
          };
        } else {
          addText();
        }
      };

      // Añadir el resto de datos
      const addText = () => {
        linea += 130;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(196, 20, 28);
        doc.text('Años en la fiesta:', 10, linea);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(candidata.vidaEnFogueres.anyosFiesta.value.toString(), 57, linea);

        linea += 10;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(196, 20, 28);
        doc.text('Curriculum festero:', 10, linea);

        linea += 10;

        const curriculum: any[] = JSON.parse(candidata.vidaEnFogueres.curriculum.value);
        curriculum.forEach(cargo => {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          if (cargo.comienzo !== cargo.final) {
            doc.text(`${this.capitalizeFirstLetter(cargo.cargo)} - Años: ${cargo.comienzo} - ${cargo.final}`, 57, linea);
          } else if (cargo.comienzo === cargo.final) {
            doc.text(`${this.capitalizeFirstLetter(cargo.cargo)} - Año: ${cargo.comienzo}`, 57, linea);
          }
          linea += 5;
        });

        linea += 5;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(196, 20, 28);
        doc.text('Formación académica:', 10, linea);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(this.capitalizeFirstLetter(candidata.academico.formacion.value), 57, linea);

        linea += 10;

        if (candidata.academico.situacionLaboral.value) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(196, 20, 28);
          doc.text('Situación laboral:', 10, linea);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.text(this.capitalizeFirstLetter(candidata.academico.situacionLaboral.value), 57, linea);
        }

        linea += 10;

        if (candidata.academico.aficiones.value) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(196, 20, 28);
          doc.text('Aficiones:', 10, linea);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.text(this.capitalizeFirstLetter(candidata.academico.aficiones.value), 57, linea);
        }

        if (descarga) {
          doc.save(`Candidata_${candidata.informacionPersonal.nombre.value}.pdf`);
          resolve();
        } else {
          resolve(doc.output('datauristring'));
        }
      };

      addImages();
    });
  }

  // generarLibro(data: CandidataData[]) {
  //   const doc = new jsPDF();
  //   this.loading = true;

  //   for (let candidata of data) {
  //     const pagina = this.generarPagina(candidata, false);
  //     if (pagina) {
  //       doc.addPage();
  //       doc.addImage(pagina, 'JPEG', 0, 0, 210, 297);
  //     }
  //   }

  //   this.loading = false;
  //   doc.save('Libro_Candidatas.pdf');
  // }

  // generarPagina(candidata: CandidataData, descarga: boolean = true): string | void {
  //   const doc = new jsPDF();
  //   let linea = 10;

  //   // Añadir nombre y número de orden
  //   doc.setFontSize(20);
  //   doc.setFont('helvetica', 'bold');
  //   doc.setTextColor(196, 20, 28);
  //   doc.text(candidata.vidaEnFogueres.asociacion_label.value, 10, linea);
  //   doc.setTextColor(196, 20, 28);
  //   doc.text(candidata.vidaEnFogueres.asociacion_order.value.toString(), 200, linea, { align: 'right' });

  //   linea += 5;

  //   // Añadir línea horizontal
  //   doc.setDrawColor(220, 124, 124);
  //   doc.line(10, linea, 200, linea);

  //   linea += 5;

  //   // Añadir asociación
  //   doc.setFontSize(12);
  //   doc.setTextColor(227, 116, 28);
  //   doc.text(candidata.informacionPersonal.nombre.value, 10, linea);


  //   // Añadir imágenes
  //   const addImages = () => {
  //     if (candidata.documentacion.fotoBelleza.value) {
  //       const img1 = new Image();
  //       img1.src = candidata.documentacion.fotoBelleza.value;
  //       img1.onload = () => {
  //         doc.addImage(img1, 'JPEG', 10, 30, 90, 120);
  //         if (candidata.documentacion.fotoCalle.value) {
  //           const img2 = new Image();
  //           img2.src = candidata.documentacion.fotoCalle.value;
  //           img2.onload = () => {
  //             doc.addImage(img2, 'JPEG', 110, 30, 90, 120);
  //             addText();
  //           };
  //         } else {
  //           addText();
  //         }
  //       };
  //     } else if (candidata.documentacion.fotoCalle.value) {
  //       const img2 = new Image();
  //       img2.src = candidata.documentacion.fotoCalle.value;
  //       img2.onload = () => {
  //         doc.addImage(img2, 'JPEG', 110, 30, 90, 120);
  //         addText();
  //       };
  //     } else {
  //       addText();
  //     }
  //   };

  //   // Añadir el resto de datos
  //   const addText = () => {
  //     linea = 160;

  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(196, 20, 28);
  //     doc.text('Años en la fiesta:', 10, 160);

  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(0, 0, 0);
  //     doc.text(candidata.vidaEnFogueres.anyosFiesta.value.toString(), 57, linea);

  //     linea += 10;

  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(196, 20, 28);
  //     doc.text('Curriculum festero:', 10, linea);

  //     linea += 5;

  //     const curriculum: any[] = JSON.parse(candidata.vidaEnFogueres.curriculum.value);
  //     curriculum.forEach(cargo => {
  //       doc.setFont('helvetica', 'normal');
  //       doc.setTextColor(0, 0, 0);
  //       if (cargo.comienzo !== cargo.final) {
  //         doc.text(`${this.capitalizeFirstLetter(cargo.cargo)} - Años: ${cargo.comienzo} - ${cargo.final}`, 57, linea);
  //       } else if (cargo.comienzo === cargo.final) {
  //         doc.text(`${this.capitalizeFirstLetter(cargo.cargo)} - Año: ${cargo.comienzo}`, 57, linea);
  //       }
  //       linea += 5;
  //     })

  //     linea += 5;

  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(196, 20, 28);
  //     doc.text('Formación académica:', 10, linea);

  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(0, 0, 0);
  //     doc.text(this.capitalizeFirstLetter(candidata.academico.formacion.value), 57, linea);

  //     linea += 10;

  //     if (candidata.academico.situacionLaboral.value) {
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(196, 20, 28);
  //       doc.text('Situación laboral:', 10, linea);

  //       doc.setFont('helvetica', 'normal');
  //       doc.setTextColor(0, 0, 0);
  //       doc.text(this.capitalizeFirstLetter(candidata.academico.situacionLaboral.value), 57, linea);
  //     }

  //     linea += 10;

  //     if (candidata.academico.aficiones.value) {
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(196, 20, 28);
  //       doc.text('Aficiones:', 10, linea);

  //       doc.setFont('helvetica', 'normal');
  //       doc.setTextColor(0, 0, 0);
  //       doc.text(this.capitalizeFirstLetter(candidata.academico.aficiones.value), 57, linea);
  //     }

  //   };

  //   addImages();

  //   if (descarga) {
  //     doc.save(`Candidata_${candidata.informacionPersonal.nombre.value}.pdf`);
  //   } else {
  //     return doc.output('datauristring');
  //   }
  // }

  capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    text = text.toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

}
