/**
 * Censo Hogueras
 * Censo-Hogueras
 *
 * OpenAPI spec version: 1.0.0
 * Contact: you@your-company.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
export interface Asociado {
    [key: string]: any;
    /**
     * Identificador del asociado
     */
    id: number;
    /**
     * NIF del usuario, consiste en 8 dígitos seguidos de una letra mayúscula.
     */
    nif: string;
    /**
     * Nombre del usuario.
     */
    nombre: string;
    /**
     * Apellidos del usuario.
     */
    apellidos: string;
    /**
     * Número de teléfono del usuario.
     */
    telefono: string;
    /**
     * Correo electrónico del usuario.
     */
    email: string;
    /**
     * Contraseña del usuario.
     */
    password?: string;
    /**
     * Dirección postal del usuario.
     */
    direccion?: string;
    /**
     * Código postal de la dirección del usuario.
     */
    codigoPostal?: string;
    /**
     * Fecha de nacimiento del usuario en formato YYYY-MM-DD.
     */
    fechaNacimiento?: string;
    /**
     * Indica si el componente está activo o no.
     */
    active?: number;
    /**
     * Imagen que tiene la asociado.
     */
    img?: string;
}
