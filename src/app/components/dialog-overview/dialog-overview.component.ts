import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LabelsFormulario } from '../../model/candidata-data.model';
import { Asociacion } from '../../services/external-api/external-api';

@Component({
  selector: 'app-dialog-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './dialog-overview.component.html',
  styleUrl: './dialog-overview.component.scss'
})
export class DialogOverviewComponent implements OnInit {
  Object = Object;
  LabelsFormulario = LabelsFormulario;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data.datos['curriculum']) {
      this.data.datos['curriculum'].value = JSON.parse(this.data.datos['curriculum'].value);
    }
    if (this.data.datos['asociacion']) {
      this.data.datos['asociacion'].value = this.data.asociaciones.find((asociacion: Asociacion) => asociacion.id.toString() === this.data.datos['asociacion'].value).nombre;
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
