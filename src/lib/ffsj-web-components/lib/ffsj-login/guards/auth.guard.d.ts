import { CanActivate, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { CensoService } from "../services/censo.service";
import * as i0 from "@angular/core";
export declare class AuthGuard implements CanActivate {
    private authService;
    private router;
    private censoService;
    constructor(authService: AuthService, router: Router, censoService: CensoService);
    canActivate(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthGuard, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AuthGuard>;
}
