import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventoHistorico } from '../../model/evento.model';
import { HistoricoService } from '../../services/historico.service';

@Component({
    selector: 'app-historico',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatTooltipModule
    ],
    templateUrl: './historico.component.html',
    styleUrl: './historico.component.scss',
})
export class HistoricoComponent implements OnInit {
    loading = false;
    eventosAdultas: EventoHistorico[] = [];
    eventosInfantiles: EventoHistorico[] = [];

    readonly year = 2025; // o lo que corresponda

    constructor(private historicoService: HistoricoService) { }

    async ngOnInit() {
        this.loading = true;
        try {
            const eventos = await this.historicoService.getEventos(this.year);

            this.eventosAdultas = eventos.filter((e) => e.tipoCandidata === 'adultas');
            this.eventosInfantiles = eventos.filter((e) => e.tipoCandidata === 'infantiles');
        } catch (e) {
            console.error('Error cargando eventos de histórico:', e);
        } finally {
            this.loading = false;
        }
    }
}
