import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { CandidataData } from '../../../model/candidata-data.model';
import { FirebaseStorageService } from '../../../services/storage.service';

const DEFAULT_IMAGE_URL = 'https://staticfoguerapp.hogueras.es/CANDIDATAS/default.png';

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

  alternateImageUrl: string = '';
  currentImage: string = '';

  anotaciones: string = '';
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

    this.currentImage = this.resolveMainImage();
    this.alternateImageUrl = this.resolveAlternateImage();
  }

  private resolveMainImage(): string {
    const belle = this.candidataData?.documentacion?.fotoBelleza?.value;
    if (belle && belle.trim() !== '') {
      return belle;
    }
    const calle = this.candidataData?.documentacion?.fotoCalle?.value;
    if (calle && calle.trim() !== '') {
      return calle;
    }
    return DEFAULT_IMAGE_URL;
  }

  private resolveAlternateImage(): string {
    const calle = this.candidataData?.documentacion?.fotoCalle?.value;
    if (calle && calle.trim() !== '') {
      return calle;
    }
    const belle = this.candidataData?.documentacion?.fotoBelleza?.value;
    if (belle && belle.trim() !== '') {
      return belle;
    }
    return DEFAULT_IMAGE_URL;
  }

  toggleImage() {
    const main = this.resolveMainImage();
    const alt = this.resolveAlternateImage();
    this.currentImage = (this.currentImage === main) ? alt : main;
  }

  saveAnotaciones() {
    this.firebaseStorageService.addAnotation(
      { candidata: this.candidataData.id.value, anotacion: this.anotaciones },
      this.idUsuario,
      this.candidataData.id.value
    );
  }

  loadAnotation() {
    if (localStorage.getItem('candidatasData')) {
      const data = JSON.parse(localStorage.getItem('candidatasData')!);
      this.anotaciones =
        data.anotaciones.find((anotacion: any) =>
          anotacion.candidata === this.candidataData.id.value
        )?.anotacion || '';
    }
  }

}
