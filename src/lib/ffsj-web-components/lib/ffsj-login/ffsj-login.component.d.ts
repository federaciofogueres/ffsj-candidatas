import { EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FfsjAlertService } from '../ffsj-alert/ffsj-alert.service';
import { AuthService } from './services/auth.service';
import * as i0 from "@angular/core";
export declare class FfsjLoginComponent {
    private authService;
    private alertService;
    title: string;
    subtitle: string;
    logStatus: EventEmitter<boolean>;
    username: FormControl<string | null>;
    password: FormControl<string | null>;
    repeatPassword: FormControl<string | null>;
    loading: boolean;
    showChangePasswordForm: boolean;
    idAsociadoToChangePassword: number;
    constructor(authService: AuthService, alertService: FfsjAlertService);
    ngOnInit(): void;
    login(): Promise<void>;
    changePassword(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FfsjLoginComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FfsjLoginComponent, "lib-ffsj-login", never, { "title": { "alias": "title"; "required": false; }; "subtitle": { "alias": "subtitle"; "required": false; }; }, { "logStatus": "logStatus"; }, never, never, true, never>;
}
