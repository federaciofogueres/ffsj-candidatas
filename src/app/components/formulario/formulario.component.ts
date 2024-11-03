import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { FfsjSpinnerComponent } from 'ffsj-web-components';
import { CandidataData } from '../../model/candidata-data.model';
import { CandidataService } from '../../services/candidatas.service';
import { CensoService } from '../../services/censo.service';
import { Asociado } from '../../services/external-api/asociado';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FfsjSpinnerComponent,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.scss'
})
export class FormularioComponent implements OnInit {
  FormGroup = FormGroup;

  loading: boolean = false;

  asociadoLogged: Asociado = {
    id: 0,
    nif: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    email: ''
  }

  asociaciones: any[] = [
    { id: 1, label: 'Prueba 1' },
    { id: 2, label: 'Prueba 2' },
    { id: 3, label: 'Prueba 3' },
    { id: 4, label: 'Prueba 4' },
  ]

  candidataForm!: FormGroup;

  dniTouched = false;
  currentStep = 1;

  personalInfo = this.fb.group({
    dni: ['', [Validators.required, this.dniValidator]],
    nombre: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    ciudad: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  fogueresInfo = this.fb.group({
    asociacion: ['', Validators.required],
    anyosFiesta: ['', Validators.required],
    curriculum: ['', Validators.required]
  });

  academicInfo = this.fb.group({
    formacion: ['', Validators.required],
    situacionLaboral: ['', Validators.required],
    observaciones: ['', Validators.required]
  });

  constructor(
    private censoService: CensoService,
    private fb: FormBuilder,
    private candidataService: CandidataService
  ) {

  }

  async ngOnInit() {
    this.loading = true;
    try {
      await this.loadAsociadoData();
      this.loadAsociadoDataOnForm(this.asociadoLogged);
    } catch (error) {
      console.error('Error loading asociado data:', error);
    }
    this.loading = false;
  }

  loadAsociadoData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.censoService.asociadosGetById(this.candidataService.getIdUsuario()).subscribe({
        next: (response: any) => {
          if (response.status.status === 200) {
            this.asociadoLogged = response.asociados[0];
            resolve();
          } else {
            reject('Error: Status not 200');
          }
        },
        error: (err) => reject(err)
      });
    });
  }

  loadAsociadoDataOnForm(asociadoData?: Asociado) {

    this.personalInfo.patchValue({
      dni: asociadoData?.nif || '',
      nombre: asociadoData?.nombre || '',
      fechaNacimiento: asociadoData?.['fecha_nacimiento'] || '',
      ciudad: asociadoData?.direccion?.split(',')[0] || '',
      telefono: asociadoData?.telefono || '',
      email: asociadoData?.email || ''
    });

    this.fogueresInfo.patchValue({
      asociacion: '',
      anyosFiesta: '',
      curriculum: ''
    });

    this.academicInfo.patchValue({
      formacion: '',
      situacionLaboral: '',
      observaciones: ''
    });

  }

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
      id: this.asociadoLogged.id.toString() || '',
      dni: this.personalInfo.get('dni')?.value || '',
      nombre: this.personalInfo.get('nombre')?.value || '',
      fechaNacimiento: this.personalInfo.get('fechaNacimiento')?.value || '',
      ciudad: this.personalInfo.get('ciudad')?.value || '',
      email: this.personalInfo.get('email')?.value || '',
      telefono: this.personalInfo.get('telefono')?.value || '',

      curriculum: this.fogueresInfo.get('curriculum')?.value || '',
      anyosFiesta: this.fogueresInfo.get('anyosFiesta')?.value || '',
      asociacion: this.fogueresInfo.get('asociacion')?.value || '',

      formacion: this.academicInfo.get('formacion')?.value || '',
      situacionLaboral: this.academicInfo.get('situacionLaboral')?.value || '',
      observaciones: this.academicInfo.get('observaciones')?.value || '',

      edad: this.calcularEdad(this.personalInfo.get('fechaNacimiento')?.value || '').toString() || '',
      fotoCalle: '',
      fotoFiesta: '',
      cesionDerechos: '',
      compromisoDisponibilidad: ''
    };
    console.log(candidata, this.candidataForm.value);

  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

}
