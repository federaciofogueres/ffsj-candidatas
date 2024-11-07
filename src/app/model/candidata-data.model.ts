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