import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CandidataData } from '../../model/candidata-data.model';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.scss'
})
export class FormularioComponent {

  asociaciones: any[] = [
    {id: 1, label: 'Prueba 1'},
    {id: 2, label: 'Prueba 2'},
    {id: 3, label: 'Prueba 3'},
    {id: 4, label: 'Prueba 4'},
  ]

  candidataForm: FormGroup = this.fb.group({
    dni: ['', [Validators.required, this.dniValidator]],
    nombre: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    formacion: ['', [Validators.required]],
    situacionLaboral: ['', [Validators.required]],
    curriculum: ['', [Validators.required]],
    anyosFiesta: ['', [Validators.required]],
    ciudad: ['', [Validators.required]],
    email: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    observaciones: ['', [Validators.required]],
    asociacion: ['', [Validators.required]],
  });

  dniTouched = false;

  constructor(
    private fb: FormBuilder,
  ) {}

  dniValidator(control: AbstractControl): { [key: string]: any } | null {
    const dni = control.value;
    const re = /^[0-9]{8}[A-Za-z]$/;
    if (!re.test(dni)) {
      return { 'invalidDni': true };
    }
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const numbers = dni.slice(0, 8);
    const expectedLetter = letters[numbers % 23];
    const letter = dni.slice(8);
    return expectedLetter === letter.toUpperCase() ? null : { 'invalidDni': true };
  }

  calcularEdad(fechaNacimiento: string): number {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  procesar() {
    const candidata: CandidataData = {
      id: this.candidataForm.get('id')?.value || '',
      dni: this.candidataForm.get('dni')?.value || '',
      nombre: this.candidataForm.get('nombre')?.value || '',
      fechaNacimiento: this.candidataForm.get('fechaNacimiento')?.value || '',
      formacion: this.candidataForm.get('formacion')?.value || '',
      situacionLaboral: this.candidataForm.get('situacionLaboral')?.value || '',
      curriculum: this.candidataForm.get('curriculum')?.value || '',
      anyosFiesta: this.candidataForm.get('anyosFiesta')?.value || '',
      edad: this.calcularEdad(this.candidataForm.get('fechaNacimiento')?.value).toString() || '',
      ciudad: this.candidataForm.get('ciudad')?.value || '',
      email: this.candidataForm.get('email')?.value || '',
      telefono: this.candidataForm.get('telefono')?.value || '',
      observaciones: this.candidataForm.get('observaciones')?.value || '',
      asociacion: this.candidataForm.get('asociacion')?.value || '',
      fotoCalle: this.candidataForm.get('fotoCalle')?.value || '',
      fotoFiesta: this.candidataForm.get('fotoFiesta')?.value || '',
      cesionDerechos: this.candidataForm.get('cesionDerechos')?.value || '',
      compromisoDisponibilidad: this.candidataForm.get('compromisoDisponibilidad')?.value || ''
    };
    console.log(candidata);

  }

}
