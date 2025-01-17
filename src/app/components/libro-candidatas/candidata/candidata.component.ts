import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';


import { MatTabsModule } from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { CandidataData } from '../../../model/candidata-data.model';
import { FirebaseStorageService } from '../../../services/storage.service';

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

  idUsuario: string = '';

  constructor(
    private breakpointObserver: BreakpointObserver,
    private firebaseStorageService: FirebaseStorageService,
    private cookieService: CookieService
  ) { }

  async ngOnInit() {
    this.candidataData = JSON.parse(localStorage.getItem('candidataData') || '');
    this.idUsuario = this.cookieService.get('idUsuario');
    this.loadAnotation();

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
    this.firebaseStorageService.addAnotation({ candidata: this.candidataData.id.value, anotacion: this.anotaciones }, this.idUsuario, this.candidataData.id.value);
  }

  loadAnotation() {
    if (localStorage.getItem('candidatasData')) {
      this.anotaciones = JSON.parse(localStorage.getItem('candidatasData')!).anotaciones.find((anotacion: any) => anotacion.candidata === this.candidataData.id.value)?.anotacion || '';
    }
  }

}
