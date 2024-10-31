import { Subscription } from 'rxjs';
import { AlertType } from './alertType.enum';
import { FfsjAlertService } from './ffsj-alert.service';
import * as i0 from "@angular/core";
export declare class FfsjAlertComponent {
    private ffsjAlertService;
    message: string | null;
    type: AlertType;
    subscription: Subscription;
    constructor(ffsjAlertService: FfsjAlertService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    closeAlert(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FfsjAlertComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FfsjAlertComponent, "lib-ffsj-alert", never, {}, {}, never, never, true, never>;
}
