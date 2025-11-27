import { Injectable } from '@angular/core';
import { AuthService } from 'ffsj-web-components';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { CensoService } from './censo.service';
import { Asociado } from './external-api/asociado';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private asociadoActual: Asociado | null = null;
    private idUsuario: number | null = null;

    constructor(
        private cookieService: CookieService,
        private authService: AuthService,
        private censoService: CensoService
    ) { }

    /**
     * Devuelve el id de usuario (asociado) extraído del token.
     * - Lo cachea en this.idUsuario.
     * - Lo guarda también en la cookie 'idUsuario'.
     * - Si hay algún problema devuelve null.
     */
    getIdUsuario(token?: string): number | null {
        // Si ya lo tenemos cacheado, lo devolvemos
        if (this.idUsuario !== null) {
            return this.idUsuario;
        }

        // Intentar obtener token del AuthService si no nos lo pasan
        if (!token) {
            token = this.authService.getToken();
        }
        if (!token) {
            console.warn('UsuarioService.getIdUsuario: no hay token disponible');
            return null;
        }

        try {
            const decodedToken: any = jwtDecode(token);
            const id = decodedToken?.id;

            if (id === undefined || id === null) {
                console.warn('UsuarioService.getIdUsuario: el token no contiene "id"');
                return null;
            }

            this.idUsuario = Number(id);
            this.cookieService.set('idUsuario', String(this.idUsuario));
            return this.idUsuario;
        } catch (e) {
            console.error('UsuarioService.getIdUsuario: error al decodificar el token', e);
            return null;
        }
    }

    /**
     * Devuelve el asociado actual (cacheado si ya se cargó antes).
     */
    async getAsociadoActual(): Promise<Asociado> {
        if (this.asociadoActual) {
            return this.asociadoActual;
        }

        const idUsuario = this.getIdUsuario();
        if (idUsuario === null) {
            return Promise.reject('No se pudo obtener idUsuario desde el token');
        }

        return new Promise<Asociado>((resolve, reject) => {
            this.censoService.asociadosGetById(idUsuario).subscribe({
                next: (response: any) => {
                    if (
                        response?.status?.status === 200 &&
                        Array.isArray(response.asociados) &&
                        response.asociados.length
                    ) {
                        this.asociadoActual = response.asociados[0] as Asociado;
                        resolve(this.asociadoActual);
                    } else {
                        reject('Error: respuesta sin asociados o status != 200');
                    }
                },
                error: (err) => reject(err),
            });
        });
    }

    /**
     * Helper para obtener el nombre completo del usuario actual.
     */
    async getUsuarioNombreCompleto(): Promise<string> {
        const asociado = await this.getAsociadoActual();
        return `${asociado.nombre} ${asociado.apellidos}`.trim();
    }
}
