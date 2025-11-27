import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { AlertButtonType, FfsjDialogAlertService, FfsjSpinnerComponent } from 'ffsj-web-components';
import { CandidataData } from '../../model/candidata-data.model';
import { CensoService } from '../../services/censo.service';
import { Asociado } from '../../services/external-api/asociado';
import { Asociacion, ResponseAsociaciones } from '../../services/external-api/external-api';
import { HistoricoService } from '../../services/historico.service';
import { FirebaseStorageService } from '../../services/storage.service';
import { VisorType } from '../home/home.component';
import { PrivacyDialogComponent } from '../privacy-dialog/privacy-dialog.component';
import { ResultDialogComponent } from '../result-dialog/result-dialog.component';
import { FormErrorComponent } from './form-error/form-error.component';
import { FormFieldComponent } from './form-field/form-field.component';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [
    FormFieldComponent,
    FormErrorComponent,
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

  @Input()
  visor!: VisorType;

  @Input()
  asociado!: Asociado;

  @Output()
  cambioVisor: EventEmitter<VisorType> = new EventEmitter<VisorType>();

  loading: boolean = false;

  asociaciones: Asociacion[] = [];

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
  });

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
    autorizacionFoguera: [null, [this.fileSizeValidator(5)]],
    compromisoDisponibilidad: [null, [this.fileSizeValidator(5)]],
    derechosAutor: [null, [this.fileSizeValidator(5)]],
    dniEscaneado: [null, [this.fileSizeValidator(5)]],
    fotoBelleza: [null, [this.fileSizeValidator(5)]],
    fotoCalle: [null, [this.fileSizeValidator(5)]],
  });

  fileFields = [
    { name: 'autorizacionFoguera', label: 'Autorización Foguera' },
    { name: 'compromisoDisponibilidad', label: 'Compromiso Disponibilidad' },
    { name: 'derechosAutor', label: 'Derechos de autor' },
    {
      name: 'dniEscaneado',
      label: `DNI Escaneado ${this.personalInfo.get('tipoCandidata')?.value === 'infantiles'
        ? 'o libro de familia si no dispone de DNI'
        : ''}`
    },
    { name: 'fotoBelleza', label: 'Foto Belleza' },
    { name: 'fotoCalle', label: 'Foto Calle' },
  ];

  existingDocuments: Record<string, string | null> = {
    autorizacionFoguera: null,
    compromisoDisponibilidad: null,
    derechosAutor: null,
    dniEscaneado: null,
    fotoBelleza: null,
    fotoCalle: null
  };

  loadedFromFirebase = false;

  constructor(
    private censoService: CensoService,
    private fb: FormBuilder,
    private firebaseStorageService: FirebaseStorageService,
    private dialog: MatDialog,
    private dialogAlertService: FfsjDialogAlertService,
    private historicoService: HistoricoService
  ) { }

  async ngOnInit() {
    this.loading = true;
    try {
      await this.loadAsociaciones();
      await this.getAsociacion();
      await this.loadInitialData();  // 👈 NUEVO

      this.academicInfo.get('observaciones')?.disable();
    } catch (error) {
      console.error('Error loading asociado data:', error);
    }
    this.loading = false;
  }

  private async loadInitialData() {
    const tipoCandidata =
      this.calcularEdad(this.asociado['fecha_nacimiento']) >= 18 ? 'adultas' : 'infantiles';

    const data = await this.firebaseStorageService.getCandidataByIdAsociado(
      this.asociado.id.toString(),
      tipoCandidata
    );

    if (data) {
      this.loadedFromFirebase = true;      // 👈 IMPORTANTE
      this.loadFirebaseDataOnForm(data);   // aquí se hace el patchValue de asociacion desde Firebase
    } else {
      this.loadedFromFirebase = false;
      this.loadAsociadoDataOnForm(this.asociado); // rellenas con datos del back
    }
  }



  private loadFirebaseDataOnForm(data: any) {
    // Datos personales
    this.personalInfo.patchValue({
      dni: data.dni || '',
      nombre: data.nombre || '',
      fechaNacimiento: data.fechaNacimiento || '',
      ciudad: data.ciudad || '',
      telefono: data.telefono || '',
      email: data.email || '',
      tipoCandidata: data.tipoCandidata || ''
    });

    // Vida en Fogueres
    this.fogueresInfo.patchValue({
      asociacion: data.asociacion ? +data.asociacion : this.defaultAsociacionId,
      anyosFiesta: data.anyosFiesta || '',
      curriculum: {
        cargo: '',
        comienzo: '',
        final: ''
      }
    });

    // Cargos (curriculum) guardados como JSON
    try {
      this.cargos = data.curriculum ? JSON.parse(data.curriculum) : [];
    } catch {
      this.cargos = [];
    }

    // Académico
    this.academicInfo.patchValue({
      formacion: data.formacion || '',
      situacionLaboral: data.situacionLaboral || '',
      observaciones: data.observaciones || '',
      aficiones: data.aficiones || ''
    });

    // Responsables
    this.responsableInfo.patchValue({
      nombreTutor1: data.nombreTutor1 || '',
      nombreTutor2: data.nombreTutor2 || '',
      telefonoTutor1: data.telefonoTutor1 || '',
      telefonoTutor2: data.telefonoTutor2 || ''
    });

    // Documentación:
    this.existingDocuments = {
      autorizacionFoguera: data.autorizacionFoguera || null,
      compromisoDisponibilidad: data.compromisoDisponibilidad || null,
      derechosAutor: data.derechosAutor || null,
      dniEscaneado: data.dniEscaneado || null,
      fotoBelleza: data.fotoBelleza || null,
      fotoCalle: data.fotoCalle || null
    };
  }



  loadAsociaciones(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.censoService.asociacionesGet().subscribe({
        next: (response: ResponseAsociaciones) => {
          if (response.status?.status === 200 && response.asociaciones) {
            this.asociaciones = response.asociaciones.filter(
              a => a['tipo_asociacion'] === 2
            );
          }
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  getAsociacion(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.censoService.getHistoricoByAsociado(this.asociado?.id).subscribe({
        next: (response: any) => {
          const registrosFiltrados = response.historico.filter(
            (registro: any) => registro.ejercicio >= 2024
          );

          const idAsociacionesUnicas = [
            ...new Set(registrosFiltrados.map((r: any) => r.idAsociacion))
          ];

          const asociacionesFiltradas = this.asociaciones.filter(a =>
            idAsociacionesUnicas.includes(a.id)
          );

          this.defaultAsociacionId = asociacionesFiltradas[0]?.id ?? -1;

          // SOLO si no hemos cargado desde Firebase
          if (!this.loadedFromFirebase) {
            this.fogueresInfo.patchValue({ asociacion: this.defaultAsociacionId });
          }

          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }



  loadAsociadoDataOnForm(asociadoData?: Asociado) {

    const fechaNacimiento = new Date((asociadoData?.['fecha_nacimiento'] as string).split(' ')[0]);

    this.personalInfo.patchValue({
      dni: asociadoData?.nif || '',
      nombre: `${asociadoData?.nombre} ${asociadoData?.apellidos}` || '',
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
    // activamos spinner
    this.loading = true;

    // valores del form de documentación (File | null)
    const files = this.documentacionForm.value as any;

    /**
     * Sube un fichero nuevo o, si no hay, mantiene la URL existente
     * en this.existingDocuments[field].
     */
    const uploadOrKeep = async (
      field: keyof typeof this.existingDocuments,
      storageFieldName: string
    ): Promise<string> => {
      const newFile = files[field]; // File del form

      if (newFile) {
        // hay archivo nuevo → lo subimos a Firebase Storage
        return await this.uploadFile(storageFieldName, newFile);
      }

      // no hay archivo nuevo → si hay URL ya guardada, la mantenemos
      if (this.existingDocuments[field]) {
        return this.existingDocuments[field] as string;
      }

      // ni archivo nuevo ni URL previa → queda vacío
      return '';
    };

    // obtenemos las URLs finales (subiendo solo lo necesario)
    const [
      autorizacionFogueraUrl,
      compromisoDisponibilidadUrl,
      derechosAutorUrl,
      dniEscaneadoUrl,
      fotoBellezaUrl,
      fotoCalleUrl
    ] = await Promise.all([
      uploadOrKeep('autorizacionFoguera', 'autorizacionFoguera'),
      uploadOrKeep('compromisoDisponibilidad', 'compromisoDisponibilidad'),
      uploadOrKeep('derechosAutor', 'derechosAutor'),
      uploadOrKeep('dniEscaneado', 'dniEscaneado'),
      uploadOrKeep('fotoBelleza', 'fotoBelleza'),
      uploadOrKeep('fotoCalle', 'fotoCalle')
    ]);

    // construimos el objeto candidata que se enviará a Firestore
    const candidata: CandidataData = {
      id: { value: this.asociado.id.toString() || '', required: true },
      informacionPersonal: {
        dni: { value: this.personalInfo.get('dni')?.value || '', required: true },
        nombre: { value: this.personalInfo.get('nombre')?.value || '', required: true },
        fechaNacimiento: { value: this.personalInfo.get('fechaNacimiento')?.value || '', required: true },
        ciudad: { value: this.personalInfo.get('ciudad')?.value || '', required: true },
        email: { value: this.personalInfo.get('email')?.value || '', required: true },
        telefono: { value: this.personalInfo.get('telefono')?.value || '', required: true },
        edad: {
          value:
            this.calcularEdad(this.personalInfo.get('fechaNacimiento')?.value || '').toString() || '',
          required: true
        },
        tipoCandidata: {
          value: this.personalInfo.get('tipoCandidata')?.value || '',
          required: true
        }
      },

      vidaEnFogueres: {
        asociacion: {
          value: this.fogueresInfo.get('asociacion')?.value?.toString() || '',
          required: true
        },
        anyosFiesta: {
          value: this.fogueresInfo.get('anyosFiesta')?.value || '',
          required: true
        },
        curriculum: {
          value: JSON.stringify(this.cargos) || '',
          required: true
        },
        // si no tienes estos controles en el form, puedes dejarlos vacíos
        asociacion_label: {
          value: this.fogueresInfo.get('asociacion_label')?.value || '',
          required: true
        },
        asociacion_order: {
          value: this.fogueresInfo.get('asociacion_order')?.value || '',
          required: true
        }
      },

      academico: {
        formacion: {
          value: this.academicInfo.get('formacion')?.value || '',
          required: true
        },
        situacionLaboral: {
          value: this.academicInfo.get('situacionLaboral')?.value || '',
          required: true
        },
        observaciones: {
          value: this.academicInfo.get('observaciones')?.value || '',
          required: true
        },
        aficiones: {
          value: this.academicInfo.get('aficiones')?.value || '',
          required: true
        }
      },

      documentacion: {
        autorizacionFoguera: {
          value: autorizacionFogueraUrl,
          required: true
        },
        compromisoDisponibilidad: {
          value: compromisoDisponibilidadUrl,
          required: true
        },
        derechosAutor: {
          value: derechosAutorUrl,
          required: true
        },
        dniEscaneado: {
          value: dniEscaneadoUrl,
          required: true
        },
        fotoBelleza: {
          value: fotoBellezaUrl,
          required: true
        },
        fotoCalle: {
          value: fotoCalleUrl,
          required: true
        }
      },

      responsables: {
        nombreTutor1: {
          value: this.responsableInfo.get('nombreTutor1')?.value || '',
          required: true
        },
        nombreTutor2: {
          value: this.responsableInfo.get('nombreTutor2')?.value || '',
          required: true
        },
        telefonoTutor1: {
          value: this.responsableInfo.get('telefonoTutor1')?.value || '',
          required: true
        },
        telefonoTutor2: {
          value: this.responsableInfo.get('telefonoTutor2')?.value || '',
          required: true
        }
      }
    };

    try {
      await this.firebaseStorageService.addCandidata(candidata);
      console.log('Candidata publicada en Firestore');

      // 🔥 Registrar en histórico
      const tipoCandidata = this.personalInfo.get('tipoCandidata')?.value as 'adultas' | 'infantiles';
      const year = 2025; // o bien saca esto de una constante/config

      const candidataNombre =
        (this.personalInfo.get('nombre')?.value as string | undefined) || '';

      await this.historicoService.registrarEvento({
        year,
        tipoCandidata,
        usuarioId: this.asociado.id.toString(),
        usuarioNombre: `${this.asociado.nombre.toString()} ${this.asociado.apellidos.toString()}`,
        candidataId: this.asociado.id.toString(),
        candidataNombre, // ✅ nunca undefined
        tipo: this.loadedFromFirebase ? 'actualizacion' : 'creacion',
        descripcion: this.loadedFromFirebase
          ? 'Actualización de datos desde formulario'
          : 'Creación de candidata desde formulario',
      });


      this.dialog.open(ResultDialogComponent, {
        data: { message: 'El formulario se ha enviado correctamente.' }
      });
    } catch (error) {
      console.error('Error publicando candidata en Firestore:', error);

      this.dialog.open(ResultDialogComponent, {
        data: { message: 'Hubo un error al enviar el formulario. Por favor, inténtelo de nuevo.' }
      });
    } finally {
      this.loading = false;
    }

    this.dialog.afterAllClosed.subscribe({
      next: () => {
        this.cambioVisor.emit('menu');
      }
    });
  }


  private uploadFile(fieldName: string, file: File): Promise<string> {
    const asociacionId = this.fogueresInfo.get('asociacion')?.value;
    const asociacion = this.asociaciones.find(a => a.id === Number(asociacionId));
    const asociacionNombre = asociacion ? asociacion.nombre.replace(/\s+/g, '_') : 'sin-nombre';

    // sacar extensión del archivo original
    const originalName = file.name;                   // ej: "autorizacion.pdf"
    const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
    const sanitizedExt = ext ? `.${ext}` : '';

    const tipo = this.personalInfo.get('tipoCandidata')?.value;

    const filePath = `candidatas/2025/${tipo}/${fieldName}/${asociacionId}-${asociacionNombre}${sanitizedExt}`;

    // const filePath = `candidatas/2025/${this.personalInfo.get('tipoCandidata')?.value}/${fieldName}/${this.fogueresInfo.get('asociacion')?.value}-${this.fogueresInfo.get('nombre')?.value}`;
    return this.firebaseStorageService.uploadFile(filePath, file);
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    const control = this.documentacionForm.get(field);

    if (!control) return;

    if (file) {
      control.setValue(file);
    } else {
      control.setValue(null);
    }

    // 👇 Esto hace que se vea el error en app-form-error
    control.markAsTouched();
    control.updateValueAndValidity();
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

  fileSizeValidator(maxSizeMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (file && file.size > maxSizeMB * 1024 * 1024) {
        return { fileSize: true };
      }
      return null;
    };
  }

  // 👇 NUEVO: decide qué icono mostrar en cada paso
  isStepCompleted(index: number): boolean {
    const tipo = this.personalInfo.get('tipoCandidata')?.value;

    // paso 0: datos personales
    if (index === 0) {
      return this.personalInfo.valid;
    }

    // si es infantil hay un paso más en medio
    if (tipo === 'infantiles') {
      if (index === 1) return this.responsableInfo.valid;
      if (index === 2) return this.fogueresInfo.valid;
      if (index === 3) return this.academicInfo.valid;
      if (index === 4) return this.documentacionForm.valid;
      return false;
    }

    // si es adulta
    if (tipo === 'adultas') {
      if (index === 1) return this.fogueresInfo.valid;
      if (index === 2) return this.academicInfo.valid;
      if (index === 3) return this.documentacionForm.valid;
    }

    return false;
  }

  getFileName(url: string | null | undefined): string {
    if (!url) return '';
    return decodeURIComponent(url.split('/').pop()!.split('?')[0]);
  }

  replaceDocument(fieldName: string) {
    const dialogRef = this.dialogAlertService.openDialogAlert({
      title: 'Cambiar documento',
      content: 'Al cambiar el documento se borrará de la base de datos el actual, ¿deseas proceder con el cambio de todas formas?',
      buttonsAlert: [AlertButtonType.Cancelar, AlertButtonType.Aceptar]
    });

    dialogRef.afterClosed().subscribe((result: AlertButtonType | string | undefined) => {
      if (result === AlertButtonType.Aceptar) {
        // El usuario confirma → limpiamos la URL y mostramos el input file
        this.existingDocuments[fieldName] = null;
      }
      // Si pulsa Cancelar o cierra el diálogo → no hacemos nada
    });
  }



}
