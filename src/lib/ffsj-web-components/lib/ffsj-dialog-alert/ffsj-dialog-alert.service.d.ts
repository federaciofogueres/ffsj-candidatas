import { MatDialog } from '@angular/material/dialog';
import { DataAlert, FfsjDialogAlertComponent } from './ffsj-dialog-alert.component';
import * as i0 from "@angular/core";
export declare class FfsjDialogAlertService {
    private dialog;
    constructor(dialog: MatDialog);
    openDialogAlert(data: DataAlert): import("@angular/material/dialog").MatDialogRef<FfsjDialogAlertComponent, any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FfsjDialogAlertService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FfsjDialogAlertService>;
}
