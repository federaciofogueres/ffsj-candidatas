import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, orderBy, query } from '@angular/fire/firestore';
import { EventoHistorico, TipoEventoHistorico } from '../model/evento.model';

@Injectable({
    providedIn: 'root',
})
export class HistoricoService {
    constructor(private firestore: Firestore) { }

    private getHistoricoCollectionRef(year: number) {
        // candidatas/2025/historico
        return collection(this.firestore, `candidatas/${year}/historico`);
    }

    async registrarEvento(params: {
        year: number;
        tipoCandidata: 'adultas' | 'infantiles';
        candidataId: string;
        candidataNombre?: string;
        usuarioId: string;
        usuarioNombre?: string;
        tipo: TipoEventoHistorico;
        descripcion?: string;
    }): Promise<void> {
        const colRef = this.getHistoricoCollectionRef(params.year);

        const evento: Omit<EventoHistorico, 'id'> = {
            tipoCandidata: params.tipoCandidata,
            candidataId: params.candidataId,
            candidataNombre: params.candidataNombre,
            usuarioId: params.usuarioId,
            usuarioNombre: params.usuarioNombre,
            tipo: params.tipo,
            descripcion: params.descripcion,
            timestamp: Date.now(),
        };

        await addDoc(colRef, evento);
    }

    async getEventos(year: number): Promise<EventoHistorico[]> {
        const colRef = this.getHistoricoCollectionRef(year);
        const q = query(colRef, orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);

        return snap.docs.map((doc) => {
            const data = doc.data() as Omit<EventoHistorico, 'id'>;
            return {
                id: doc.id,
                ...data,
            } as EventoHistorico;
        });
    }
}
