import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

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
    id: ['', [Validators.required]],
    dni: ['', [Validators.required, this.dniValidator]],
    nombre: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    formacion: ['', [Validators.required]],
    situacionLaboral: ['', [Validators.required]],
    curriculum: ['', [Validators.required]],
    anyosFiesta: ['', [Validators.required]],
    edad: ['', [Validators.required]],
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

  procesar() {
    console.log(this.candidataForm.value);
  }

}
