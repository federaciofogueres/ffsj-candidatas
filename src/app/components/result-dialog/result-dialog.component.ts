import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ResultDialogData {
  success?: boolean;         // true = OK, false = error
  title?: string;
  message?: string;
  errors?: string[];         // listado de errores (opcional)
}

@Component({
  selector: 'app-result-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  templateUrl: './result-dialog.component.html',
  styleUrl: './result-dialog.component.scss'
})
export class ResultDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ResultDialogData
  ) { }
}
