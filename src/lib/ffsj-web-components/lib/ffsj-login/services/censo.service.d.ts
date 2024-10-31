import { HttpClient, HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuration } from '../external-api/configuration';
import { ResponseAsociaciones } from '../external-api/responseAsociaciones';
import { ResponseAsociados } from '../external-api/responseAsociados';
import { ResponseToken } from '../external-api/responseToken';
import { Usuario } from '../external-api/usuario';
import * as i0 from "@angular/core";
export declare class CensoService {
    private httpClient;
    protected basePath: string;
    defaultHeaders: HttpHeaders;
    configuration: Configuration;
    constructor(httpClient: HttpClient);
    /**
     * Listar todas las asociaciones
     *
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    asociacionesGet(observe?: 'body', reportProgress?: boolean): Observable<ResponseAsociaciones>;
    asociacionesGet(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<ResponseAsociaciones>>;
    asociacionesGet(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<ResponseAsociaciones>>;
    /**
     * Realizar la autentificación del usuario
     *
     * @param body
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    doLogin(body: Usuario, observe?: 'body', reportProgress?: boolean): Observable<ResponseToken>;
    doLogin(body: Usuario, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<ResponseToken>>;
    doLogin(body: Usuario, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<ResponseToken>>;
    /**
   * Obtener un asociado
   *
   * @param asociado
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
    asociadosGetById(asociado: number, observe?: 'body', reportProgress?: boolean): Observable<ResponseAsociados>;
    asociadosGetById(asociado: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<ResponseAsociados>>;
    asociadosGetById(asociado: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<ResponseAsociados>>;
    /**
* Actualizar un asociado
*
* @param body
* @param asociado
* @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
* @param reportProgress flag to report request and response progress.
*/
    asociadosPut(body: ResponseAsociados, asociado: number, observe?: 'body', reportProgress?: boolean): Observable<ResponseAsociados>;
    asociadosPut(body: ResponseAsociados, asociado: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<ResponseAsociados>>;
    asociadosPut(body: ResponseAsociados, asociado: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<ResponseAsociados>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CensoService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CensoService>;
}
