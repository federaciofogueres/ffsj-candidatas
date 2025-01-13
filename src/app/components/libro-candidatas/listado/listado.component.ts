import { Component, Input } from '@angular/core';
import { CandidataCardComponent } from '../candidata-card/candidata-card.component';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [
    CandidataCardComponent
  ],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent {

  @Input() candidatas!: any;

  constructor() { }

  ngOnInit() {
    console.log(this.candidatas);
  }

}
