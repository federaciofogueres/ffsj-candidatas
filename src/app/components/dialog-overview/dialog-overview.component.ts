import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-overview',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dialog-overview.component.html',
  styleUrl: './dialog-overview.component.scss'
})
export class DialogOverviewComponent {
  Object = Object;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
