import { HttpClient, HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configuration } from './external-api/configuration';
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
    public asociadosGetById(asociado: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

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

        return this.httpClient.request<ResponseAsociados>('get',`${this.basePath}/asociados/${encodeURIComponent(String(asociado))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }
    
}