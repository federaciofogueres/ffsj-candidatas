import { Subject } from 'rxjs';
import { AlertType } from './alertType.enum';
import * as i0 from "@angular/core";
export declare class FfsjAlertService {
    alert$: Subject<{
        type: AlertType;
        message: string;
        duration: number;
    }>;
    success(message: string, duration?: number): void;
    danger(message: string, duration?: number): void;
    warning(message: string, duration?: number): void;
    info(message: string, duration?: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FfsjAlertService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FfsjAlertService>;
}
