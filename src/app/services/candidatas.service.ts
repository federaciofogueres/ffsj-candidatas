import { Injectable } from "@angular/core";
import { AuthService } from "ffsj-web-components";
import { jwtDecode } from "jwt-decode";
import { CookieService } from "ngx-cookie-service";
import { InfoShowTable } from "../components/admin/admin.component";
import { CandidataData, TiposCampos } from "../model/candidata-data.model";
import { CensoService } from "./censo.service";
import { Asociacion, ResponseAsociaciones } from "./external-api/external-api";
import { FirebaseStorageService } from "./storage.service";

const BASE_URL_IMAGES = 'https://staticfoguerapp.hogueras.es/CANDIDATAS';

@Injectable({
    providedIn: 'root'
})
export class CandidataService {

    private idUsuario = -1;
    protected adultas: CandidataData[] = [];
    protected infantiles: CandidataData[] = [];

    asociaciones: Asociacion[] = [];

    adultasData: InfoShowTable[] = [];
    infantilesData: InfoShowTable[] = [];

    columnasAdultas: string[] = [];
    columnasInfantiles: string[] = [];
    columnasAdultasText: string[] = [];
    columnasInfantilesText: string[] = [];

    anotaciones: any;

    constructor(
        private firebaseStorageService: FirebaseStorageService,
        private cookieService: CookieService,
        private authService: AuthService,
        private censoService: CensoService,
    ) { }

    getIdUsuario(token?: string) {
        if (this.idUsuario !== -1) {
            return this.idUsuario;
        }
        if (!token) {
            token = this.authService.getToken();
        }
        const decodedToken: any = jwtDecode(token);
        this.cookieService.set('idUsuario', decodedToken.id);
        this.idUsuario = decodedToken.id;
        return decodedToken.id;
    }

    async loadAsociaciones(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.censoService.asociacionesGet().subscribe({
                next: (response: ResponseAsociaciones) => {
                    if (response.status?.status === 200) {
                        this.asociaciones = response.asociaciones || [];
                        resolve();
                    } else {
                        reject('Error en la respuesta del servidor');
                    }
                },
                error: (err) => reject(err)
            });
        });
    }

    async loadFromBD(collection: string): Promise<CandidataData[]> {
        let arrayData: CandidataData[] = [];
        try {
            const data = await this.firebaseStorageService.getCollection(collection);
            data.forEach((dataBD: any) => {
                const revisadoObj = dataBD['revisado'];
                const revisadoStatus = revisadoObj?.status === true;

                const candidata: CandidataData = {
                    id: { value: dataBD['id'], required: true },
                    informacionPersonal: {
                        dni: { value: dataBD['dni'], required: true },
                        nombre: { value: dataBD['nombre'], required: true },
                        fechaNacimiento: { value: dataBD['fechaNacimiento'], required: true },
                        ciudad: { value: dataBD['ciudad'], required: true },
                        email: { value: dataBD['email'], required: true },
                        telefono: { value: dataBD['telefono'], required: true },
                        edad: { value: dataBD['edad'], required: true },
                        tipoCandidata: { value: dataBD['tipoCandidata'], required: true }
                    },
                    vidaEnFogueres: {
                        asociacion_order: { value: dataBD['asociacion_order'], required: false },
                        asociacion_label: { value: dataBD['asociacion_label'], required: false },
                        asociacion: { value: dataBD['asociacion'], required: true },
                        anyosFiesta: { value: dataBD['anyosFiesta'], required: true },
                        curriculum: { value: dataBD['curriculum'], required: true }
                    },
                    academico: {
                        formacion: { value: dataBD['formacion'], required: true },
                        situacionLaboral: { value: dataBD['situacionLaboral'], required: false },
                        observaciones: { value: dataBD['observaciones'], required: false },
                        aficiones: { value: dataBD['aficiones'], required: false }
                    },
                    documentacion: {
                        autorizacionFoguera: { value: dataBD['autorizacionFoguera'], required: true },
                        compromisoDisponibilidad: { value: dataBD['compromisoDisponibilidad'], required: true },
                        derechosAutor: { value: dataBD['derechosAutor'], required: true },
                        dniEscaneado: { value: dataBD['dniEscaneado'], required: true },
                        fotoBelleza: { value: dataBD['fotoBelleza'], required: true },
                        fotoCalle: { value: dataBD['fotoCalle'], required: true }
                    },
                    responsables: {
                        nombreTutor1: { value: dataBD['nombreTutor1'], required: false },
                        nombreTutor2: { value: dataBD['nombreTutor2'], required: false },
                        telefonoTutor1: { value: dataBD['telefonoTutor1'], required: false },
                        telefonoTutor2: { value: dataBD['telefonoTutor2'], required: false }
                    },
                    // 👇 nuevo campo opcional, leído de Firestore si existe
                    revisado: revisadoStatus
                };
                arrayData.push(candidata);
            });
        } catch (error) {
            console.error('Error obteniendo datos:', error);
        }
        return arrayData;
    }

    async getCandidatas(reload: boolean = false) {

        const candidatasDataRaw = localStorage.getItem('candidatasData');

        // Asegurar que las asociaciones están cargadas antes de cualquier procesado
        await this.loadAsociaciones();

        // Intentar parsear cache si existe y no pedimos reload
        let cachedData: any = null;
        if (candidatasDataRaw && !reload) {
            try {
                cachedData = JSON.parse(candidatasDataRaw);
            } catch (e) {
                console.warn('candidatasData en localStorage corrupto o inválido, forzando reload', e);
                cachedData = null;
            }
        }

        // Si pedimos reload o no hay cache válida, cargar desde BD
        if (reload || !cachedData) {
            this.adultas = await this.loadFromBD('candidatas/2025/adultas');
            this.infantiles = await this.loadFromBD('candidatas/2025/infantiles');
        } else {
            // Usar cache si disponible, si faltan colecciones en la cache, cargarlas desde BD
            this.adultas = cachedData.adultas ? cachedData.adultas : await this.loadFromBD('candidatas/2025/adultas');
            this.infantiles = cachedData.infantiles ? cachedData.infantiles : await this.loadFromBD('candidatas/2025/infantiles');
        }

        // 👉 aquí ya NO intentamos meter 'revisado' en columnas;
        // esa columna es solo visual y la añade AdminComponent.

        ({ nuevasColumnasText: this.columnasAdultasText, nuevasColumnas: this.columnasAdultas, infoTabla: this.adultasData } =
            this.agrupaColumnas('adultas', this.adultas));
        ({ nuevasColumnasText: this.columnasInfantilesText, nuevasColumnas: this.columnasInfantiles, infoTabla: this.infantilesData } =
            this.agrupaColumnas('infantiles', this.infantiles));

        this.updateAsociacionValues(this.adultas, this.adultasData);
        this.updateAsociacionValues(this.infantiles, this.infantilesData);

        this.adultas = this.sortCandidatasByOrder(this.adultas);
        this.infantiles = this.sortCandidatasByOrder(this.infantiles);

        // Asegurar que existe idUsuario en cookie (getIdUsuario también cachea)
        try {
            this.getIdUsuario();
        } catch (e) {
            console.warn('No se pudo obtener idUsuario desde token', e);
        }

        const usuarioId = this.cookieService.get('idUsuario') || (this.idUsuario !== -1 ? String(this.idUsuario) : null);
        if (usuarioId) {
            try {
                const data = await this.firebaseStorageService.getCollection('candidatas/2025/anotaciones/' + usuarioId + '/anotaciones');
                if (Array.isArray(data)) {
                    this.anotaciones = data.map((anotation: any) => anotation['anotation']);
                }
            } catch (e) {
                console.warn('Error cargando anotaciones:', e);
            }
        }

        const returnObject = {
            adultas: this.adultas,
            infantiles: this.infantiles,
            adultasData: this.adultasData,
            infantilesData: this.infantilesData,
            columnasAdultas: this.columnasAdultas,
            columnasInfantiles: this.columnasInfantiles,
            columnasAdultasText: this.columnasAdultasText,
            columnasInfantilesText: this.columnasInfantilesText,
            anotaciones: this.anotaciones
        }

        try {
            localStorage.setItem('candidatasData', JSON.stringify(returnObject));
        } catch (e) {
            console.warn('No se pudo guardar candidatasData en localStorage', e);
        }

        return returnObject;
    }

    sortCandidatasByOrder(candidatas: CandidataData[]) {
        return candidatas.sort((a: CandidataData, b: CandidataData) => {
            const aOrder = Number(a.vidaEnFogueres.asociacion_order?.value) || 0;
            const bOrder = Number(b.vidaEnFogueres.asociacion_order?.value) || 0;
            return aOrder - bOrder;
        });
    }

    updateAsociacionValues(data: CandidataData[], infoTabla: InfoShowTable[]): void {
        data.forEach((item, index) => {
            const asociacion = this.asociaciones.find(asociacion => {
                return item.vidaEnFogueres.asociacion.value === String(asociacion.id)
            });
            if (asociacion) {
                item.vidaEnFogueres.asociacion_label = { value: asociacion.nombre, required: false };
                item.vidaEnFogueres.asociacion_order = { value: asociacion['asociacion_order'], required: false };
                item.documentacion.fotoBelleza.value = `${BASE_URL_IMAGES}/belleza/${item.informacionPersonal.tipoCandidata.value}/${item.vidaEnFogueres.asociacion_order.value}.jpg`;
                item.documentacion.fotoCalle.value = `${BASE_URL_IMAGES}/calle/${item.informacionPersonal.tipoCandidata.value}/${item.vidaEnFogueres.asociacion_order.value}.jpg`;
            }

            // sincronizar revisado en la tabla si quieres que se vea directamente
            if (infoTabla[index]) {
                infoTabla[index].revisado = !!item.revisado;
            }
        });
    }

    agrupaColumnas(tipoCandidata: string, array: CandidataData[]) {
        let nuevasColumnas = ['id', 'foguera', 'informacionPersonal', 'vidaEnFogueres', 'academico', 'documentacion'];
        let nuevasColumnasText = ['Id', 'Foguera', 'Información Personal', 'Vida en Fogueres', 'Académico', 'Documentación'];
        if (tipoCandidata === 'infantiles') {
            nuevasColumnas.push('responsables');
            nuevasColumnasText.push('Responsables');
        }
        let infoTabla: InfoShowTable[] = [];
        array.sort((a, b) => a.vidaEnFogueres.asociacion.value.localeCompare(b.vidaEnFogueres.asociacion.value))
        array.forEach(c => {
            const info: InfoShowTable = {
                id: c.id.value,
                foguera: this.asociaciones.find(asociacion => { return c.vidaEnFogueres.asociacion.value === String(asociacion.id) })?.nombre || 'Sin datos',
                informacionPersonal: this.checkCampos(c.informacionPersonal) ? 'Completo' : 'Faltan datos',
                vidaEnFogueres: this.checkCampos(c.vidaEnFogueres) ? 'Completo' : 'Faltan datos',
                academico: this.checkCampos(c.academico) ? 'Completo' : 'Faltan datos',
                documentacion: this.checkCampos(c.documentacion) ? 'Completo' : 'Faltan datos',
                responsables: this.checkCampos(c.responsables) ? 'Completo' : 'Faltan datos',
                revisado: !!c.revisado
            }
            infoTabla.push(info);
        })
        return { nuevasColumnasText, nuevasColumnas, infoTabla };
    }

    checkCampos(campos: TiposCampos): boolean {
        return Object.values(campos).every((campo: any) => {
            if (campo.required) {
                return campo.value !== null && campo.value !== undefined && String(campo.value).trim() !== '';
            }
            return true;
        });
    }

    async setRevisado(
        tipo: 'adultas' | 'infantiles',
        idCandidata: string,
        status: boolean
    ): Promise<void> {
        // idUsuario del usuario logueado (ya usas esto en otros métodos)
        const idAsociado = this.getIdUsuario();

        const revisionData = {
            idAsociado,                        // id del usuario que hace la marca
            timestamp: new Date().toISOString(), // fecha/hora del cambio
            status                              // true/false
        };

        return this.firebaseStorageService.setRevisado(tipo, idCandidata, revisionData);
    }

}
