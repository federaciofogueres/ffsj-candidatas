import { Routes } from '@angular/router';
import { FormularioComponent } from './components/formulario/formulario.component';

export const routes: Routes = [
    { path: '', component: FormularioComponent },
    // { path: 'login', component: LoginComponent },
    { path: '**', component: FormularioComponent },
];
