import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { FfsjSpinnerComponent } from 'ffsj-web-components';
import { CandidataData } from '../../model/candidata-data.model';
import { CandidataService } from '../../services/candidatas.service';
import { CensoService } from '../../services/censo.service';
import { Asociado } from '../../services/external-api/asociado';
import { Asociacion, ResponseAsociaciones } from '../../services/external-api/external-api';
import { FirebaseStorageService } from '../../services/storage.service';
import { PrivacyDialogComponent } from '../privacy-dialog/privacy-dialog.component';
import { ResultDialogComponent } from '../result-dialog/result-dialog.component';

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
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule
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

  asociaciones: Asociacion[] = []

  candidataForm!: FormGroup;

  dniTouched = false;
  currentStep = 1;
  defaultAsociacionId = -1;
  cargos: any[] = [];

  personalInfo = this.fb.group({
    dni: ['', [Validators.required]],
    nombre: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    ciudad: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tipoCandidata: ['', Validators.required]
  });

  responsableInfo = this.fb.group({
    nombreTutor1: ['', Validators.required],
    nombreTutor2: [''],
    telefonoTutor1: ['', Validators.required],
    telefonoTutor2: [''],
    patriaPotestad: ['', Validators.required],
  }, { validators: this.patriaPotestadValidator() });

  fogueresInfo = this.fb.group({
    asociacion: [this.defaultAsociacionId, Validators.required],
    anyosFiesta: ['', Validators.required],
    curriculum: this.fb.group({
      cargo: ['', []],
      comienzo: ['', []],
      final: ['', []]
    })
  });

  academicInfo = this.fb.group({
    formacion: ['', Validators.required],
    situacionLaboral: ['', Validators.required],
    aceptoTratamiento: [false, []],
    observaciones: ['', Validators.required],
    aficiones: ['', Validators.required]
  }, { validators: this.tipoCandidataValidator(this.personalInfo) });

  documentacionForm = this.fb.group({
    autorizacionFoguera: [null, []],
    compromisoDisponibilidad: [null, []],
    derechosAutor: [null, []],
    dniEscaneado: [null, []],
    fotoBelleza: [null, []],
    fotoCalle: [null, []],
  });

  constructor(
    private censoService: CensoService,
    private fb: FormBuilder,
    private candidataService: CandidataService,
    private firebaseStorageService: FirebaseStorageService,
    private dialog: MatDialog
  ) {

  }

  async ngOnInit() {
    this.loading = true;
    try {
      this.loadAsociaciones();
      await this.loadAsociadoData();
      this.getAsociacion();
      this.loadAsociadoDataOnForm(this.asociadoLogged);
      this.academicInfo.get('observaciones')?.disable();
    } catch (error) {
      console.error('Error loading asociado data:', error);
    }
    this.loading = false;
  }

  loadAsociaciones() {
    this.censoService.asociacionesGet().subscribe({
      next: (response: ResponseAsociaciones) => {
        if (response.status?.status === 200 && response.asociaciones) {
          this.asociaciones = response.asociaciones.filter(asociacion => asociacion['tipo_asociacion'] === 2);
        }
      }
    })
  }

  getAsociacion() {
    this.censoService.getHistoricoByAsociado(this.asociadoLogged?.id).subscribe({
      next: (response: any) => {
        const registrosFiltrados = response.historico.filter((registro: any) => registro.ejercicio >= 2024);
        const idAsociacionesUnicas = [...new Set(registrosFiltrados.map((registro: any) => registro.idAsociacion))];

        const asociacionesFiltradas = this.asociaciones.filter(asociacion => idAsociacionesUnicas.includes(asociacion.id));
        this.defaultAsociacionId = asociacionesFiltradas[0]?.id
        this.fogueresInfo.patchValue({ asociacion: this.defaultAsociacionId });
      },
      error: (err) => {
        console.error('Error fetching historico:', err);
      }
    });
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

    const fechaNacimiento = new Date((asociadoData?.['fecha_nacimiento'] as string).split(' ')[0]);

    this.personalInfo.patchValue({
      dni: asociadoData?.nif || '',
      nombre: asociadoData?.nombre || '',
      fechaNacimiento: fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : '',
      ciudad: asociadoData?.direccion?.split(',')[0] || '',
      telefono: asociadoData?.telefono || '',
      email: asociadoData?.email || '',
      tipoCandidata: this.calcularEdad(asociadoData?.['fecha_nacimiento']) >= 18 ? 'adultas' : 'infantiles'
    });

    this.fogueresInfo.patchValue({
      asociacion: this.defaultAsociacionId,
      anyosFiesta: '',
      curriculum: {
        cargo: '',
        comienzo: '',
        final: ''
      }
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

  async procesar() {

    this.loading = true;

    const files = this.documentacionForm.value;
    const fileUrls = await Promise.all([
      files.fotoCalle ? this.uploadFile('fotoCalle', files.fotoCalle) : Promise.resolve(''),
      files.fotoBelleza ? this.uploadFile('fotoBelleza', files.fotoBelleza) : Promise.resolve(''),
      files.compromisoDisponibilidad ? this.uploadFile('compromisoDisponibilidad', files.compromisoDisponibilidad) : Promise.resolve(''),
      files.derechosAutor ? this.uploadFile('derechosAutor', files.derechosAutor) : Promise.resolve('')
    ]);

    const candidata: CandidataData = {
      id: this.asociadoLogged.id.toString() || '',
      dni: this.personalInfo.get('dni')?.value || '',
      nombre: this.personalInfo.get('nombre')?.value || '',
      fechaNacimiento: this.personalInfo.get('fechaNacimiento')?.value || '',
      ciudad: this.personalInfo.get('ciudad')?.value || '',
      email: this.personalInfo.get('email')?.value || '',
      telefono: this.personalInfo.get('telefono')?.value || '',
      tipoCandidata: this.personalInfo.get('tipoCandidata')?.value || '',

      curriculum: JSON.stringify(this.cargos) || '',
      anyosFiesta: this.fogueresInfo.get('anyosFiesta')?.value || '',
      asociacion: this.fogueresInfo.get('asociacion')?.value?.toString() || '',

      formacion: this.academicInfo.get('formacion')?.value || '',
      situacionLaboral: this.academicInfo.get('situacionLaboral')?.value || '',
      observaciones: this.academicInfo.get('observaciones')?.value || '',

      edad: this.calcularEdad(this.personalInfo.get('fechaNacimiento')?.value || '').toString() || '',
      fotoCalle: fileUrls[0],
      fotoFiesta: fileUrls[1],
      cesionDerechos: fileUrls[3],
      compromisoDisponibilidad: fileUrls[2]
    };
    this.loading = false;
    console.log(candidata);
    console.log(this.personalInfo);
    console.log(this.fogueresInfo);
    console.log(this.academicInfo);
    console.log(this.documentacionForm);
    // Publicar el objeto candidata en Firestore
    try {
      await this.firebaseStorageService.addCandidata(candidata);
      console.log('Candidata publicada en Firestore');
      this.dialog.open(ResultDialogComponent, {
        data: {
          message: 'El formulario se ha enviado correctamente.'
        }
      });
    } catch (error) {
      console.error('Error publicando candidata en Firestore:', error);
      this.dialog.open(ResultDialogComponent, {
        data: {
          message: 'Hubo un error al enviar el formulario. Por favor, inténtelo de nuevo.'
        }
      });
    }
  }

  private uploadFile(fieldName: string, file: File): Promise<string> {
    const filePath = `candidatas/2024/${this.personalInfo.get('tipoCandidata')?.value}/${fieldName}/${this.fogueresInfo.get('asociacion')?.value}-${this.fogueresInfo.get('nombre')?.value}`;
    return this.firebaseStorageService.uploadFile(filePath, file);
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.documentacionForm.patchValue({
        [field]: file
      });
    }
  }

  addCurriculum() {
    const curriculum = this.fogueresInfo.get('curriculum')?.value;
    this.cargos.push(curriculum);
    this.fogueresInfo.get('curriculum')?.reset();
  }

  patriaPotestadValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const patriaPotestad = control.get('patriaPotestad')?.value;
      const nombreTutor2 = control.get('nombreTutor2');
      const telefonoTutor2 = control.get('telefonoTutor2');

      if (patriaPotestad === 'no') {
        if (!nombreTutor2?.value) {
          nombreTutor2?.setErrors({ required: true });
        }
        if (!telefonoTutor2?.value) {
          telefonoTutor2?.setErrors({ required: true });
        }
      } else {
        nombreTutor2?.setErrors(null);
        telefonoTutor2?.setErrors(null);
      }

      return null;
    };
  }

  tipoCandidataValidator(personalInfo: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const tipoCandidata = personalInfo.get('tipoCandidata')?.value;
      const situacionLaboral = control.get('situacionLaboral');
      const aficiones = control.get('aficiones');

      if (tipoCandidata === 'adultas') {
        if (!situacionLaboral?.value) {
          situacionLaboral?.setErrors({ required: true });
          aficiones?.setErrors(null);
        } else {
          situacionLaboral?.setErrors(null);
        }
      }

      if (tipoCandidata === 'infantiles') {
        if (!aficiones?.value) {
          aficiones?.setErrors({ required: true });
          situacionLaboral?.setErrors(null);
        } else {
          aficiones?.setErrors(null);
        }
      }

      return null;
    };
  }

  toggleObservaciones(event: any) {
    const observacionesControl = this.academicInfo.get('observaciones');
    if (observacionesControl) {
      if (event.checked) {
        observacionesControl.enable();
      } else {
        observacionesControl.disable();
      }
    }

    // Abre el diálogo de política de privacidad
    if (event.checked) {
      this.dialog.open(PrivacyDialogComponent);
    }
  }

  removeCurriculum(index: number) {
    this.cargos.splice(index, 1);
  }

}
