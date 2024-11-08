import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LabelsFormulario } from '../../model/candidata-data.model';
import { Asociacion } from '../../services/external-api/external-api';

@Component({
  selector: 'app-dialog-overview',
  standalone: true,
  imports: [
    CommonModule
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
}
