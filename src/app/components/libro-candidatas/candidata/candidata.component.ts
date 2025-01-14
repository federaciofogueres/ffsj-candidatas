import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';


import { MatTabsModule } from '@angular/material/tabs';
import { CandidataData } from '../../../model/candidata-data.model';

@Component({
  selector: 'app-candidata',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatTabsModule
  ],
  templateUrl: './candidata.component.html',
  styleUrl: './candidata.component.scss'
})
export class CandidataComponent {

  Object = Object;

  candidataData!: CandidataData;

  // URL de la imagen alternativa
  alternateImageUrl: string = '';

  // Estado de volteo
  isFlipped: boolean = false;

  // URL de la imagen actual
  currentImage: string = '';

  // Anotaciones
  anotaciones: string = '';

  // Indica si es un teléfono
  isTelefono: boolean = false;

  constructor(
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit() {
    this.candidataData = JSON.parse(localStorage.getItem('candidataData') || '');

    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe((state: BreakpointState) => {
        this.isTelefono = state.matches;
      });

    this.currentImage = this.candidataData.documentacion?.fotoBelleza?.value || '';
    this.alternateImageUrl = this.candidataData.documentacion?.fotoCalle?.value || '';
  }

  toggleImage() {
    this.currentImage = this.currentImage === this.candidataData.documentacion.fotoBelleza.value
      ? this.candidataData.documentacion.fotoCalle.value
      : this.candidataData.documentacion.fotoBelleza.value;
  }

  saveAnotaciones() {
    console.log(this.anotaciones);
  }

}
