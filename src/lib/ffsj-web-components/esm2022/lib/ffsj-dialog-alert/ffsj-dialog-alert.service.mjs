import { Injectable } from '@angular/core';
import { FfsjDialogAlertComponent } from './ffsj-dialog-alert.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
export class FfsjDialogAlertService {
    constructor(dialog) {
        this.dialog = dialog;
    }
    openDialogAlert(data) {
        const dialogRef = this.dialog.open(FfsjDialogAlertComponent, {
            data: data,
            width: '600px',
        });
        return dialogRef;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: FfsjDialogAlertService, deps: [{ token: i1.MatDialog }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: FfsjDialogAlertService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: FfsjDialogAlertService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.MatDialog }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmZzai1kaWFsb2ctYWxlcnQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Zmc2otd2ViLWNvbXBvbmVudHMvc3JjL2xpYi9mZnNqLWRpYWxvZy1hbGVydC9mZnNqLWRpYWxvZy1hbGVydC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFhLHdCQUF3QixFQUFFLE1BQU0sK0JBQStCLENBQUM7OztBQUtwRixNQUFNLE9BQU8sc0JBQXNCO0lBRWpDLFlBQW9CLE1BQWlCO1FBQWpCLFdBQU0sR0FBTixNQUFNLENBQVc7SUFBSSxDQUFDO0lBRTFDLGVBQWUsQ0FBQyxJQUFlO1FBQzdCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFO1lBQzNELElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLE9BQU87U0FDZixDQUFDLENBQUE7UUFDRixPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDOytHQVZVLHNCQUFzQjttSEFBdEIsc0JBQXNCLGNBRnJCLE1BQU07OzRGQUVQLHNCQUFzQjtrQkFIbEMsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE1hdERpYWxvZyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XHJcbmltcG9ydCB7IERhdGFBbGVydCwgRmZzakRpYWxvZ0FsZXJ0Q29tcG9uZW50IH0gZnJvbSAnLi9mZnNqLWRpYWxvZy1hbGVydC5jb21wb25lbnQnO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgRmZzakRpYWxvZ0FsZXJ0U2VydmljZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGlhbG9nOiBNYXREaWFsb2cpIHsgfVxyXG5cclxuICBvcGVuRGlhbG9nQWxlcnQoZGF0YTogRGF0YUFsZXJ0KSB7XHJcbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLmRpYWxvZy5vcGVuKEZmc2pEaWFsb2dBbGVydENvbXBvbmVudCwge1xyXG4gICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICB3aWR0aDogJzYwMHB4JyxcclxuICAgIH0pXHJcbiAgICByZXR1cm4gZGlhbG9nUmVmO1xyXG4gIH1cclxufVxyXG4iXX0=