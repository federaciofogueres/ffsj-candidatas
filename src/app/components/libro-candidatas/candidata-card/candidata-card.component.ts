import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CandidataData } from '../../../model/candidata-data.model';

const DEFAULT_IMAGE_URL = 'https://staticfoguerapp.hogueras.es/CANDIDATAS/default.png';

@Component({
  selector: 'app-candidata-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidata-card.component.html',
  styleUrl: './candidata-card.component.scss'
})
export class CandidataCardComponent {

  @Input() candidataData!: CandidataData;

  alternateImageUrl: string = '';
  currentImage: string = '';
  foguera: string = '';

  constructor(
    protected router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['candidataData']) {
      this.updateCandidataData();
    }
  }

  ngOnInit() {
    this.updateCandidataData();
  }

  private resolveMainImage(): string {
    const belle = this.candidataData?.documentacion?.fotoBelleza?.value;
    if (belle && belle.trim() !== '') {
      return belle;
    }
    return DEFAULT_IMAGE_URL;
  }

  private resolveAlternateImage(): string {
    const calle = this.candidataData?.documentacion?.fotoCalle?.value;
    if (calle && calle.trim() !== '') {
      return calle;
    }
    // si no hay foto de calle pero sí de bellesa
    const belle = this.candidataData?.documentacion?.fotoBelleza?.value;
    if (belle && belle.trim() !== '') {
      return belle;
    }
    return DEFAULT_IMAGE_URL;
  }

  updateCandidataData() {
    this.currentImage = this.resolveMainImage();
    this.alternateImageUrl = this.resolveAlternateImage();
    this.foguera = this.candidataData.vidaEnFogueres.asociacion_label.value;
  }

  toggleImage() {
    const main = this.resolveMainImage();
    const alt = this.resolveAlternateImage();
    this.currentImage = (this.currentImage === main) ? alt : main;
  }

  viewDetails() {
    localStorage.setItem('candidataData', JSON.stringify(this.candidataData));
    this.router.navigateByUrl('candidatas/' + this.candidataData.id.value);
  }

}
