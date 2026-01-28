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
  curriculumEntries: Array<{ cargo: string; comienzo: string; final: string }> = [];

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
    this.curriculumEntries = this.parseCurriculumEntries(
      this.candidataData?.vidaEnFogueres?.curriculum?.value
    );
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

  formatCurriculumYears(entry: { comienzo: string; final: string }): string {
    if (!entry.comienzo && !entry.final) {
      return '';
    }
    if (entry.comienzo === entry.final || !entry.final) {
      return `Año ${entry.comienzo}`;
    }
    if (!entry.comienzo) {
      return `Hasta ${entry.final}`;
    }
    return `Años ${entry.comienzo} - ${entry.final}`;
  }

  private parseCurriculumEntries(raw: string | unknown): Array<{ cargo: string; comienzo: string; final: string }> {
    if (!raw) {
      return [];
    }
    if (Array.isArray(raw)) {
      return raw.map((item: any) => ({
        cargo: item?.cargo ?? '',
        comienzo: item?.comienzo ?? '',
        final: item?.final ?? ''
      }));
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            cargo: item?.cargo ?? '',
            comienzo: item?.comienzo ?? '',
            final: item?.final ?? ''
          }));
        }
      } catch {
        return [];
      }
    }
    return [];
  }

}
