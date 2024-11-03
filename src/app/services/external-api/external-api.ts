export interface ResponseAsociaciones {
    [key: string]: any;
    asociaciones?: Array<Asociacion>;
    status?: Status;
}

export interface Asociacion {
    [key: string]: any;
    /**
     * Identificador único de la asociación.
     */
    id: number;
    /**
     * Nombre de la asociación.
     */
    nombre: string;
    /**
     * CIF de la asociación.
     */
    cif: string;
    /**
     * Dirección postal de la asociación.
     */
    direccion?: string;
    /**
     * Lema de la asociación.
     */
    lema?: string;
    /**
     * Año de fundación de la asociación.
     */
    anyoFundacion?: number;
    /**
     * Correo electrónico de contacto de la asociación.
     */
    email: string;
    /**
     * Contraseña de acceso al sistema para la asociación.
     */
    password?: string;
    /**
     * Número de teléfono de contacto de la asociación.
     */
    telefono?: string;
    /**
     * Código numérico que representa el tipo de asociación.
     */
    tipoAsociacion: number;
    /**
     * Indica si el componente está activo o no.
     */
    active?: number;
    /**
     * Imagen que tiene la asociación.
     */
    img?: string;
}

export interface Status {
    /**
     * Estado en la que acaba la llamada
     */
    status?: number;
    /**
     * Mensaje que describe el estatus que se ha puesto
     */
    message?: string;
}

export interface HistoricoAsociado {
    [key: string]: any;
    /**
     * Nombre de la asociacion.
     */
    nombreAsociacion: string;
    /**
     * Nombre del cargo que ocupa.
     */
    cargo: string;
    /**
     * Año del ejercicio correspondiente al cargo.
     */
    ejercicio: number;
    /**
     * Identificador de la asociación.
     */
    idAsociacion: number;
    /**
     * Identificador del ejercicio.
     */
    idEjercicio: number;
    /**
     * Identificador del cargo.
     */
    idCargo: number;
    /**
     * Saber si está activo el historico asociado.
     */
    active?: number;
}

export interface ResponseHistoricosAsociados {
    [key: string]: any;
    historico?: Array<HistoricoAsociado>;
    status?: Status;
}