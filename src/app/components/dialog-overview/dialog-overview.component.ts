import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LabelsFormulario } from '../../model/candidata-data.model';
import { Asociacion } from '../../services/external-api/external-api';

@Component({
  selector: 'app-dialog-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './dialog-overview.component.html',
  styleUrl: './dialog-overview.component.scss'
})
export class DialogOverviewComponent implements OnInit {
  Object = Object;
  LabelsFormulario = LabelsFormulario;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    const datos = this.data?.datos;
    if (!datos) return;

    // Sólo operar si "datos" es un objeto (evita sobrescribir arrays/primitivos)
    if (typeof datos === 'object' && datos !== null) {
      // curriculum puede venir como JSON string en datos.curriculum.value
      if (datos['curriculum'] && typeof datos['curriculum'].value === 'string') {
        try {
          datos['curriculum'].value = JSON.parse(datos['curriculum'].value);
        } catch (e) {
          console.warn('No se pudo parsear curriculum:', e);
        }
      }

      // Resolver etiqueta de asociación si vienen asociaciones y existe campo asociacion
      if (datos['asociacion'] && Array.isArray(this.data?.asociaciones)) {
        const assocId = datos['asociacion'].value;
        const found = this.data.asociaciones.find((asociacion: Asociacion) => String(asociacion.id) === String(assocId));
        if (found) {
          datos['asociacion'].value = found.nombre;
        }
      }
    }
  }

  viewFile(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'document';
    link.target = '_blank';
    link.click();
  }

  downloadFile(url: string, fileName: string): void {
    const proxyUrl = `/api${url.split('https://firebasestorage.googleapis.com')[1]}`;
    fetch(proxyUrl)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName || url.split('/').pop() || 'document';
        link.click();
        window.URL.revokeObjectURL(link.href);
      })
      .catch(console.error);
  }

}
