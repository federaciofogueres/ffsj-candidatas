export type TipoEventoHistorico = 'creacion' | 'actualizacion' | 'borrado' | 'revision';

export interface EventoHistorico {
    id?: string;

    // para tabs
    tipoCandidata: 'adultas' | 'infantiles';

    // candidata
    candidataId: string;
    candidataNombre?: string;

    // usuario
    usuarioId: string;
    usuarioNombre?: string;

    // tipo de acción
    tipo: TipoEventoHistorico;
    descripcion?: string;

    // fecha en ms (Date.now())
    timestamp: number;
}
