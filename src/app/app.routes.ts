import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { FormularioComponent } from './components/formulario/formulario.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'formulario', component: FormularioComponent, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: '**', component: HomeComponent, canActivate: [AuthGuard] },
];
