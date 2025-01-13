import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { FormularioComponent } from './components/formulario/formulario.component';
import { HomeComponent } from './components/home/home.component';
import { CandidataComponent } from './components/libro-candidatas/candidata/candidata.component';
import { LibroCandidatasComponent } from './components/libro-candidatas/libro-candidatas.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'formulario', component: FormularioComponent, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'candidatas/:id', component: CandidataComponent, canActivate: [AuthGuard] },
    { path: 'libro-candidatas', component: LibroCandidatasComponent, canActivate: [AuthGuard] },
    { path: '**', component: HomeComponent, canActivate: [AuthGuard] },
];
