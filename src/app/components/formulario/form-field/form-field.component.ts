import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormErrorComponent } from '../form-error/form-error.component';

@Component({
    selector: 'app-form-field',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormErrorComponent],
    templateUrl: './form-field.component.html'
})
export class FormFieldComponent {
    @Input() label = '';
    @Input() forId = '';
    @Input() control: AbstractControl | null = null;
    @Input() type: 'text' | 'email' | 'number' | 'date' | 'textarea' = 'text';
    @Input() placeholder = '';
    @Input() errorMessage = 'Campo obligatorio';

    // puede ser null, por eso lo tratamos en el template
    get formControl(): FormControl | null {
        return this.control as FormControl | null;
    }
}
