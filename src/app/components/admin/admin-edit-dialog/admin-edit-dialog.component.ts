import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CandidataData } from '../../../model/candidata-data.model';
import { Asociado } from '../../../services/external-api/asociado';
import { FormularioComponent } from '../../formulario/formulario.component';

export interface AdminEditDialogData {
  candidata: CandidataData;
}

@Component({
  selector: 'app-admin-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, FormularioComponent],
  templateUrl: './admin-edit-dialog.component.html',
  styleUrl: './admin-edit-dialog.component.scss'
})
export class AdminEditDialogComponent implements OnInit {
  candidata!: CandidataData;
  asociado!: Asociado;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AdminEditDialogData,
    private dialogRef: MatDialogRef<AdminEditDialogComponent>
  ) { }

  ngOnInit(): void {
    this.candidata = this.data.candidata;
    this.asociado = this.buildAsociado(this.candidata);
  }

  close() {
    this.dialogRef.close();
  }

  private buildAsociado(data: CandidataData): Asociado {
    const nombreCompleto = data.informacionPersonal.nombre.value || '';
    const partesNombre = nombreCompleto.split(' ').filter(Boolean);
    const nombre = partesNombre.shift() || nombreCompleto || '';
    const apellidos = partesNombre.join(' ');

    return {
      id: Number(data.id.value) || -1,
      nif: data.informacionPersonal.dni.value || '',
      nombre,
      apellidos,
      telefono: data.informacionPersonal.telefono.value || '',
      email: data.informacionPersonal.email.value || '',
      direccion: data.informacionPersonal.ciudad.value || '',
      ['fecha_nacimiento']: data.informacionPersonal.fechaNacimiento.value || '',
      fechaNacimiento: data.informacionPersonal.fechaNacimiento.value || ''
    } as Asociado;
  }
}
