import { MatDialogRef } from "@angular/material/dialog";
import { AlertButtonType } from './alertButtonType.enum';
import * as i0 from "@angular/core";
export interface DataAlert {
    title: string;
    content: string;
    buttonsAlert: AlertButtonType[];
}
export declare class FfsjDialogAlertComponent {
    dialogSelfRef: MatDialogRef<FfsjDialogAlertComponent>;
    data: DataAlert;
    constructor(dialogSelfRef: MatDialogRef<FfsjDialogAlertComponent>, data: DataAlert);
    static ɵfac: i0.ɵɵFactoryDeclaration<FfsjDialogAlertComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FfsjDialogAlertComponent, "lib-ffsj-dialog-alert", never, {}, {}, never, never, true, never>;
}
