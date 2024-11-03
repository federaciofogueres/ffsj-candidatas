import { HttpClient, HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configuration } from './external-api/configuration';
import { ResponseAsociaciones, ResponseHistoricosAsociados } from './external-api/external-api';
import { ResponseAsociados } from './external-api/responseAsociados';

@Injectable({
    providedIn: 'root'
})
export class CensoService {

    protected basePath = 'https://censo-api.hogueras.es/emjf1/Censo-Hogueras/1.0.0';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();

    constructor(
        private httpClient: HttpClient
    ) {

    }

    /**
     * Obtener un asociado
     * 
     * @param asociado 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public asociadosGetById(asociado: number, observe?: 'body', reportProgress?: boolean): Observable<ResponseAsociados>;
    public asociadosGetById(asociado: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<ResponseAsociados>>;
    public asociadosGetById(asociado: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<ResponseAsociados>>;
    public asociadosGetById(asociado: number, observe: any = 'body', reportProgress: boolean = false): Observable<any> {

        if (asociado === null || asociado === undefined) {
            throw new Error('Required parameter asociado was null or undefined when calling asociadosGetById.');
        }

        let headers = this.defaultHeaders;

        // authentication (BearerAuth) required
        if (this.configuration.accessToken) {
            const accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.request<ResponseAsociados>('get', `${this.basePath}/asociados/${encodeURIComponent(String(asociado))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Obtener las asociaciones de un asociado específico
     * Retorna una lista de asociaciones a las que pertenece el asociado identificado por idAsociado.
     * @param idAsociado Identificador único del asociado.
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getAsociacionesByAsociado(idAsociado: number, observe?: 'body', reportProgress?: boolean): Observable<ResponseAsociaciones>;
    public getAsociacionesByAsociado(idAsociado: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<ResponseAsociaciones>>;
    public getAsociacionesByAsociado(idAsociado: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<ResponseAsociaciones>>;
    public getAsociacionesByAsociado(idAsociado: number, observe: any = 'body', reportProgress: boolean = false): Observable<any> {

        if (idAsociado === null || idAsociado === undefined) {
            throw new Error('Required parameter idAsociado was null or undefined when calling getAsociacionesByAsociado.');
        }

        let headers = this.defaultHeaders;

        // authentication (BearerAuth) required
        if (this.configuration.accessToken) {
            const accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.request<ResponseAsociaciones>('get', `${this.basePath}/asociados/${encodeURIComponent(String(idAsociado))}/asociaciones`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Obtener el histórico del asociado
     * 
     * @param asociado 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getHistoricoByAsociado(asociado: number, observe?: 'body', reportProgress?: boolean): Observable<ResponseHistoricosAsociados>;
    public getHistoricoByAsociado(asociado: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<ResponseHistoricosAsociados>>;
    public getHistoricoByAsociado(asociado: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<ResponseHistoricosAsociados>>;
    public getHistoricoByAsociado(asociado: number, observe: any = 'body', reportProgress: boolean = false): Observable<any> {

        if (asociado === null || asociado === undefined) {
            throw new Error('Required parameter asociado was null or undefined when calling getHistoricoByAsociado.');
        }

        let headers = this.defaultHeaders;

        // authentication (BearerAuth) required
        if (this.configuration.accessToken) {
            const accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.request<ResponseHistoricosAsociados>('get', `${this.basePath}/asociados/${encodeURIComponent(String(asociado))}/historico`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
 * Listar todas las asociaciones
 * 
 * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
 * @param reportProgress flag to report request and response progress.
 */
    public asociacionesGet(observe?: 'body', reportProgress?: boolean): Observable<ResponseAsociaciones>;
    public asociacionesGet(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<ResponseAsociaciones>>;
    public asociacionesGet(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<ResponseAsociaciones>>;
    public asociacionesGet(observe: any = 'body', reportProgress: boolean = false): Observable<any> {

        let headers = this.defaultHeaders;

        // authentication (BearerAuth) required
        if (this.configuration.accessToken) {
            const accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.request<ResponseAsociaciones>('get', `${this.basePath}/asociaciones`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}