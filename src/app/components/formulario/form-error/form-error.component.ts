import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
    selector: 'app-form-error',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './form-error.component.html'
})
export class FormErrorComponent {
    @Input() control: AbstractControl | null = null;
    @Input() message = 'Campo obligatorio';

    get showError(): boolean {
        if (!this.control) return false;
        return this.control.invalid && (this.control.dirty || this.control.touched);
    }
}
