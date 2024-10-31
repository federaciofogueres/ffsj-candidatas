import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AlertType } from './alertType.enum';
import * as i0 from "@angular/core";
export class FfsjAlertService {
    constructor() {
        this.alert$ = new Subject();
    }
    success(message, duration = 5000) {
        this.alert$.next({ type: AlertType.Success, message: message, duration: duration });
    }
    danger(message, duration = 5000) {
        this.alert$.next({ type: AlertType.Danger, message: message, duration: duration });
    }
    warning(message, duration = 5000) {
        this.alert$.next({ type: AlertType.Warning, message: message, duration: duration });
    }
    info(message, duration = 5000) {
        this.alert$.next({ type: AlertType.Info, message: message, duration: duration });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: FfsjAlertService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: FfsjAlertService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.11", ngImport: i0, type: FfsjAlertService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmZzai1hbGVydC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZmZzai13ZWItY29tcG9uZW50cy9zcmMvbGliL2Zmc2otYWxlcnQvZmZzai1hbGVydC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7O0FBSzdDLE1BQU0sT0FBTyxnQkFBZ0I7SUFIN0I7UUFJRSxXQUFNLEdBQUcsSUFBSSxPQUFPLEVBQXdELENBQUM7S0FpQjlFO0lBZkMsT0FBTyxDQUFDLE9BQWUsRUFBRSxXQUFtQixJQUFJO1FBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRUQsTUFBTSxDQUFDLE9BQWUsRUFBRSxXQUFtQixJQUFJO1FBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsT0FBTyxDQUFDLE9BQWUsRUFBRSxXQUFtQixJQUFJO1FBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQWUsRUFBRSxXQUFtQixJQUFJO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNuRixDQUFDOytHQWpCVSxnQkFBZ0I7bUhBQWhCLGdCQUFnQixjQUZmLE1BQU07OzRGQUVQLGdCQUFnQjtrQkFINUIsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgQWxlcnRUeXBlIH0gZnJvbSAnLi9hbGVydFR5cGUuZW51bSc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBGZnNqQWxlcnRTZXJ2aWNlIHtcclxuICBhbGVydCQgPSBuZXcgU3ViamVjdDx7dHlwZTogQWxlcnRUeXBlLCBtZXNzYWdlOiBzdHJpbmcsIGR1cmF0aW9uOiBudW1iZXJ9PigpO1xyXG5cclxuICBzdWNjZXNzKG1lc3NhZ2U6IHN0cmluZywgZHVyYXRpb246IG51bWJlciA9IDUwMDApIHtcclxuICAgIHRoaXMuYWxlcnQkLm5leHQoeyB0eXBlOiBBbGVydFR5cGUuU3VjY2VzcywgbWVzc2FnZTogbWVzc2FnZSwgZHVyYXRpb246IGR1cmF0aW9uIH0pO1xyXG4gIH1cclxuXHJcbiAgZGFuZ2VyKG1lc3NhZ2U6IHN0cmluZywgZHVyYXRpb246IG51bWJlciA9IDUwMDApIHtcclxuICAgIHRoaXMuYWxlcnQkLm5leHQoeyB0eXBlOiBBbGVydFR5cGUuRGFuZ2VyLCBtZXNzYWdlOiBtZXNzYWdlLCBkdXJhdGlvbjogZHVyYXRpb24gfSk7XHJcbiAgfVxyXG5cclxuICB3YXJuaW5nKG1lc3NhZ2U6IHN0cmluZywgZHVyYXRpb246IG51bWJlciA9IDUwMDApIHtcclxuICAgIHRoaXMuYWxlcnQkLm5leHQoeyB0eXBlOiBBbGVydFR5cGUuV2FybmluZywgbWVzc2FnZTogbWVzc2FnZSwgZHVyYXRpb246IGR1cmF0aW9uIH0pO1xyXG4gIH1cclxuXHJcbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGR1cmF0aW9uOiBudW1iZXIgPSA1MDAwKSB7XHJcbiAgICB0aGlzLmFsZXJ0JC5uZXh0KHsgdHlwZTogQWxlcnRUeXBlLkluZm8sIG1lc3NhZ2U6IG1lc3NhZ2UsIGR1cmF0aW9uOiBkdXJhdGlvbiB9KTtcclxuICB9XHJcbn1cclxuIl19