export interface InformacionPersonal {
  dni: CampoCandidataData;
  nombre: CampoCandidataData;
  fechaNacimiento: CampoCandidataData;
  ciudad: CampoCandidataData;
  email: CampoCandidataData;
  telefono: CampoCandidataData;
  edad: CampoCandidataData;
  tipoCandidata: CampoCandidataData;
}

export interface VidaEnFogueres {
  asociacion_label: CampoCandidataData;
  asociacion_order: CampoCandidataData;
  asociacion: CampoCandidataData;
  anyosFiesta: CampoCandidataData;
  curriculum: CampoCandidataData;
}

export interface Academico {
  formacion: CampoCandidataData;
  situacionLaboral: CampoCandidataData;
  observaciones: CampoCandidataData;
  aficiones: CampoCandidataData;
}

export interface Documentacion {
  autorizacionFoguera: CampoCandidataData;
  compromisoDisponibilidad: CampoCandidataData;
  derechosAutor: CampoCandidataData;
  dniEscaneado: CampoCandidataData;
  fotoBelleza: CampoCandidataData;
  fotoCalle: CampoCandidataData;
}

export interface Responsables {
  nombreTutor1: CampoCandidataData;
  nombreTutor2: CampoCandidataData;
  telefonoTutor1: CampoCandidataData;
  telefonoTutor2: CampoCandidataData;
}

export interface CandidataData {
  id: CampoCandidataData;
  informacionPersonal: InformacionPersonal;
  vidaEnFogueres: VidaEnFogueres;
  academico: Academico;
  documentacion: Documentacion;
  responsables: Responsables;
}

export interface CampoCandidataData {
  value: string;
  required: boolean;
}

export type TiposCampos = InformacionPersonal | VidaEnFogueres | Academico | Documentacion | Responsables;

export const LabelsFormulario: { [key in string]: string } = {
  ['id']: 'ID',
  ['dni']: 'DNI',
  ['nombre']: 'Nombre',
  ['fechaNacimiento']: 'Fecha de nacimiento',
  ['ciudad']: 'Ciudad',
  ['email']: 'Email',
  ['telefono']: 'Teléfono',
  ['edad']: 'Edad',
  ['tipoCandidata']: 'Tipo de candidata',
  ['asociacion']: 'Asociación',
  ['anyosFiesta']: 'Años en la fiesta',
  ['curriculum']: 'Currículum',
  ['formacion']: 'Formación',
  ['situacionLaboral']: 'Situación laboral',
  ['observaciones']: 'Observaciones',
  ['aficiones']: 'Aficiones',
  ['autorizacionFoguera']: 'Autorización Foguera',
  ['compromisoDisponibilidad']: 'Compromiso de disponibilidad',
  ['derechosAutor']: 'Derechos de autor',
  ['dniEscaneado']: 'DNI escaneado',
  ['fotoBelleza']: 'Foto belleza',
  ['fotoCalle']: 'Foto calle',
  ['nombreTutor1']: 'Nombre del tutor 1',
  ['nombreTutor2']: 'Nombre del tutor 2',
  ['telefonoTutor1']: 'Teléfono del tutor 1',
  ['telefonoTutor2']: 'Teléfono del tutor 2',
  ['informacionPersonal']: 'Información personal',
  ['vidaEnFogueres']: 'Vida en Fogueres',
  ['academico']: 'Información académica',
  ['documentacion']: 'Documentación',
  ['responsables']: 'Responsables'
};